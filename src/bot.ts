import * as _ from 'lodash';
import * as Promise from 'bluebird';

import { TopicCollection } from './nlp/classifier';
import { PlatformMiddleware } from './types/platform';
import { Intent, Incoming, IncomingMessage, IntentGenerator, ReducerFunction, GreetingFunction, DialogFunction, StopFunction } from './types/bot';
import { UserMiddleware, User, BasicUser } from './types/user';

export { TopicCollection } from './nlp/classifier';
export { Intent, PlatformMiddleware };

import MemoryStorage from './storage/memory';
import defaultReducer from './default-reducer';
import NLPEngine from './nlp/nlp';
import Script, { EndScriptException, stopFunction, StopException, StopScriptReasons} from './script';
import Outgoing from './outgoing';
import { GreetingMessage } from './types/messages/greeting';

const DEFAULT_SCRIPT = '';
const defaultClassifierFile = process.env.CLASSIFIER_FILE ? process.env.CLASSIFIER_FILE : `${__dirname}/../nlp/classifiers.json`;

export default class Botler {
  public debugOn: Boolean = false;

  private intents: Array<IntentGenerator> = [];
  private reducer: ReducerFunction;
  public userMiddleware: UserMiddleware;
  private platforms: Array<PlatformMiddleware> = [];
  // tslint:disable-next-line:variable-name
  private _scripts: { [key: string]: Script } = {};
  private greetingScript: GreetingFunction;
  public onErrorScript: DialogFunction = defaultErrorScript;

  constructor(classifierFile: string = defaultClassifierFile) {
    const engine = new NLPEngine(classifierFile);
    this.intents = [ engine ];
    this.reducer = defaultReducer.bind(this);
    this.setUserMiddlware(new MemoryStorage(this));
    return this;
  }

  public addIntent(newIntent: IntentGenerator) {
    this.intents = [].concat(this.intents, newIntent);
    return this;
  }

  public unshiftIntent(newIntent: IntentGenerator) {
    this.intents = [].concat(newIntent, this.intents);
    return this;
  }

  public newScript(name: string = DEFAULT_SCRIPT) {
    const newScript = new Script(this, name);
    this._scripts[name] = newScript;
    return newScript;
  }

  public getScript(name: string = DEFAULT_SCRIPT) {
    return this._scripts[name];
  }

  get scripts() {
    return _.keys(this._scripts);
  }

  public addGreeting(script: GreetingFunction) {
    this.greetingScript = script;
    return this;
  }

  public setReducer(newReducer: ReducerFunction) {
    this.reducer = newReducer.bind(this);
    return this;
  }

  public setUserMiddlware(middleware: UserMiddleware) {
    this.userMiddleware = middleware;
    return this;
  }

  public addPlatform(platform: PlatformMiddleware) {
    this.platforms.push(platform);
    return this;
  }

  public addErrorHandler(dialog: DialogFunction) {
    this.onErrorScript = dialog;
    return this;
  }

  public turnOnDebug() {
    this.debugOn = true;
    return this;
  }

  public createEmptyIntent(): Intent {
    return {
      action: null,
      details: {
        confidence: 0,
      },
      topic: null,
    };
  }

  public createEmptyUser(defaults: any = {}): User {
    const anEmptyUser: User = {
      _platform: null,
      conversation: [],
      id: null,
      platform: null,
      script: null,
      scriptStage: 0,
      scriptArguments: null,
      state: null,
    };
    return _.defaults(defaults, anEmptyUser) as User;
  }

  public start() {
    this.platforms.forEach(platform => platform.start());
  }

  public stop() {
    this.platforms.forEach(platform => platform.stop());
  }

  public processGreeting(user: BasicUser): Promise<void> {
    const greetingMessage: GreetingMessage = {
      type: 'greeting',
    };
    return this.processMessage(user, greetingMessage);
  }

  public processMessage(basicUser: BasicUser, message: IncomingMessage): Promise<void> {
    console.log(basicUser);
    let user: User = null;
    let request: Incoming = null;
    let response: Outgoing = null;
    return this.userMiddleware.getUser(basicUser)
      .catch((err: Error) => _.merge(this.createEmptyUser(), basicUser))
      .then(completeUser => {
        completeUser.conversation = completeUser.conversation.concat(message);
        user = completeUser;
        response = new Outgoing(this, user);
        return completeUser;
      })
      .then(completeUser =>  this.getIntents(completeUser, message))
      .then(intents => this.reducer(intents, user))
      .then(intent => {
        request = {
          intent: intent,
          message: _.defaults({ _eaten: false }, message),
          user: user,
        };
        return this._process(user, request, response, true);
      })
      .then(() => this.userMiddleware.saveUser(user))
      .then(() => { return; });
  }

  private getIntents(user: User, message: IncomingMessage): Promise<Array<Intent>> {
    return Promise.map(this.intents, intent => intent.getIntents(message, user))
      .then(_.flatten)
      .then(_.compact);
  }

  private _process(user: User, request: Incoming, response: Outgoing, directCall: boolean = false): Promise<void> {
    return Promise.resolve()
      .then(() => {
        const blankScript = function() { return Promise.resolve(); };
        let nextScript = blankScript;
        if (this._scripts[DEFAULT_SCRIPT]) {
          nextScript = function() {
            return this.scripts[DEFAULT_SCRIPT].run(request, blankScript);
          }.bind(this);
        }

        if (request.message.type === 'greeting' && user.script === null && directCall === true) {
          if (this.greetingScript) {
            return Promise.resolve()
              .then(() => this.greetingScript(user, response))
              .then(() => {
                if (this._scripts[DEFAULT_SCRIPT]) {
                  return this._scripts[DEFAULT_SCRIPT].run(request, response, blankScript, -1);
                }
              });
          } else {
            user.script = null;
            user.scriptStage = -1;
          }
        }
        if (user.script != null && user.script !== DEFAULT_SCRIPT && this._scripts[user.script]) {
          return this._scripts[user.script].run(request, response, nextScript);
        } else if (this._scripts[DEFAULT_SCRIPT]) {
          return this._scripts[DEFAULT_SCRIPT].run(request, response, blankScript, user.scriptStage);
        } else {
          throw new Error('No idea how to chain the scripts');
        }
      })
      .catch((err: Error) => {
        if (err instanceof EndScriptException) {
          if (user.script === null) {
            return;
          }
          user.script = null;
          user.scriptStage = -1;
          user.scriptArguments = {};
          return this._process(user, request, response);
        } else if (err instanceof StopException) {
          if (err.reason === StopScriptReasons.NewScript) {
            return this._process(user, request, response);
          }
          return;
        } else {
          console.error('error caught');
          console.error(err);
          return this.onErrorScript(request, response, stopFunction);
        }
      });
  }
}

const defaultErrorScript: DialogFunction  = function(incoming: Incoming, response: Outgoing, stop: StopFunction) {
  response.sendText('Uh oh, something went wrong, can you try again?');
  return Promise.resolve();
};
