import * as _ from 'lodash';
import * as Promise from 'bluebird';
import * as util from 'util';

import { TopicCollection } from './nlp/classifier';
import { PlatformMiddleware } from './types/platform';
import { Intent, Incoming, IncomingMessage, IntentGenerator, ReducerFunction, GreetingFunction, DialogFunction, StopFunction, Logger } from './types/bot';
import { UserMiddleware, User, BasicUser } from './types/user';

export { TopicCollection } from './nlp/classifier';
export { Intent, PlatformMiddleware };

import MemoryStorage from './storage/memory';
import defaultReducer from './default-reducer';
import NLPEngine from './nlp/nlp';
import Script, { EndScriptException, EndScriptReasons, stopFunction, StopException, StopScriptReasons} from './scripting/script';
import Outgoing from './outgoing';
import { GreetingMessage } from './types/messages/greeting';

const DEFAULT_SCRIPT = '';
const defaultClassifierFile = process.env.CLASSIFIER_FILE ? process.env.CLASSIFIER_FILE : `${__dirname}/../nlp/classifiers.json`;

export default class Alana {
  public debugOn: Boolean = false;

  private intents: Array<IntentGenerator> = [];
  private reducer: ReducerFunction;
  public userMiddleware: UserMiddleware;
  private platforms: Array<PlatformMiddleware> = [];
  // tslint:disable-next-line:variable-name
  private _scripts: { [key: string]: Script } = {};
  private greetingScript: GreetingFunction;
  public onErrorScript: DialogFunction = defaultErrorScript;
  private serializedMessages: { [userid: string]: Promise<void> } = {};
  // tslint:disable-next-line:variable-name
  private _logger: Logger = console;

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

  public setLogger(logger: Logger) {
    this._logger = logger;
    return this;
  }

  get logger() {
    return this._logger;
  }

  public createEmptyIntent(): Intent {
    return {
      action: null,
      details: {
        confidence: 0,
      },
      domain: null,
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

  public processMessage(basicUser: BasicUser, message: IncomingMessage): Promise<void> {
    // serialize messages so they don't trample over each other
    if (!this.serializedMessages[basicUser.id]) {
      this.serializedMessages[basicUser.id] = Promise.resolve();
    }
    return this.serializedMessages[basicUser.id] = this.serializedMessages[basicUser.id].then(() => this._processMessage(basicUser, message));
  }

  private _processMessage(basicUser: BasicUser, message: IncomingMessage): Promise<void> {
    let user: User = null;
    let request: Incoming = null;
    let response: Outgoing = null;
    return this.userMiddleware.getUser(basicUser)
      .catch((err: Error) => _.merge(this.createEmptyUser(), basicUser))
      .then(completeUser => {
        completeUser._platform = basicUser._platform;
        completeUser.conversation = completeUser.conversation.concat(message);
        user = completeUser;
        response = new Outgoing(this, user, message.conversation_id);
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
      .then(() => {
        return this.userMiddleware.saveUser(user);
      })
      .then(() => { return; });
  }

  private getIntents(user: User, message: IncomingMessage): Promise<Array<Intent>> {
    return Promise.map(this.intents, intent => intent.getIntents(message, user))
      .then(_.flatten)
      .then((anArray: Intent[]) => _.compact<Intent>(anArray));
  }
  /**
   * @private
   * @param user The user initiating the chat
   * @param request All the incoming information about the current sessiom
   * @param response Class used to send responses back to the user
   * @param directCall True if being called by process(...) otherwise set to false to stop infinite loops
   */
  private _process(user: User, request: Incoming, response: Outgoing, directCall: boolean = false): Promise<void> {
    const savedThis = this;
    return Promise.resolve()
      .then(() => {
        const blankScript = function() {
          throw new EndScriptException(EndScriptReasons.Reached);
        };
        let nextScript: () => Promise<any> = blankScript;
        // If there is a default script set that as the next script to run
        if (savedThis._scripts[DEFAULT_SCRIPT]) {
          nextScript = function() {
              return savedThis._scripts[DEFAULT_SCRIPT].run(request, response, blankScript);
            };
        }

        if (request.message.type === 'greeting' && user.script === null && directCall === true) {
          if (savedThis.greetingScript) {
            return Promise.resolve()
              .then(() => savedThis.greetingScript(user, response))
              .then(() => {
                if (savedThis._scripts[DEFAULT_SCRIPT]) {
                  return savedThis._scripts[DEFAULT_SCRIPT].run(request, response, blankScript, -1);
                }
              });
          } else {
            user.script = null;
            user.scriptStage = -1;
          }
        }
        if (user.script != null && user.script !== DEFAULT_SCRIPT && this._scripts[user.script]) {
          return savedThis._scripts[user.script].run(request, response, nextScript);
        } else if (savedThis._scripts[DEFAULT_SCRIPT]) {
          const defaultScript = savedThis._scripts[DEFAULT_SCRIPT];
          if (request.user.scriptStage >= defaultScript.length) {
            request.user.scriptStage = 0;
          }
          return savedThis._scripts[DEFAULT_SCRIPT].run(request, response, blankScript, user.scriptStage);
        } else {
          // Confused what sript to run, may be an infinite loop?
          // If this is a greeting message just ignore it
          if (request.message.type === 'greeting') {
            return;
          }
          return;
          // throw if we require a bot to respond
          // throw new Error('No idea how to chain the scripts');
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
          return savedThis._process(user, request, response);
        } else if (err instanceof StopException) {
          if (err.reason === StopScriptReasons.NewScript) {
            return savedThis._process(user, request, response);
          }
          return;
        } else {
          this.logger.error('error caught');
          this.logger.error(err);
          return savedThis.onErrorScript(request, response, stopFunction);
        }
      });
  }
}

const defaultErrorScript: DialogFunction  = function(incoming: Incoming, response: Outgoing, stop: StopFunction) {
  response.sendText('Uh oh, something went wrong, can you try again?');
  return Promise.resolve();
};
