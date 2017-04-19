import * as _ from 'lodash';
import * as Promise from 'bluebird';
import * as util from 'util';
import * as uuid from 'uuid';

import * as Responses from './responses';
import { PlatformMiddleware } from '../types/platform';
import { IncomingMessage, Message, TextMessage, GreetingMessage, PostbackMessage } from '../types/message';
import { Button } from '../types/messages/button';
import { User } from '../types/user';
import TestPlatform from './platform';

export default class Tester {
  public readonly userId: string;
  private testPlatfom: TestPlatform;
  private promiseChain: Promise<any>;
  private currentResolve: () => void;
  private currentReject: (err?: Error) => void;
  private currentExpect: Responses.Response = null;
  private startTest: () => void;
  private timeoutReject: (err?: Error) => void;

  private timeout: number = 20;
  private checkforExtraDialogs: boolean = false;

  constructor(platform: TestPlatform, userId: string = `test-${_.random(999999)}`) {
    this.testPlatfom = platform;
    this.userId = userId;

    this.promiseChain = new Promise((resolve, reject) => {
      this.startTest = resolve;
    });
    const greeting: GreetingMessage = {
      type: 'greeting',
      id: uuid.v4(),
      conversation_id: userId,
    };
    this.addSend(greeting);
  }

  /**
   * Add a promise to the chain to expect a response from the bot
   */
  private addRespone(expectChecker: Responses.Response) {
    const savedThis = this;
    this.promiseChain = this.promiseChain.then(() => {
      savedThis.currentExpect = expectChecker;
      const aPromise = new Promise((resolve, reject) => {
        savedThis.currentResolve = resolve;
        savedThis.currentReject = reject;
      });
      return aPromise;
    });
    return this;
  }

  /**
   * Add a promise to chain to send amessage to the bot
   */
  private addSend(message: IncomingMessage) {
    const savedThis = this;
    this.promiseChain = this.promiseChain.then(() => {
      savedThis.testPlatfom.receive(this.userId, message);
      return null;
    });
    return this;
  }

  /**
   * Wait to recieve a text message from bot
   */
  public expectText(allowedPhrases: Array<string> | string): this {
    this.addRespone(new Responses.TextResponse(allowedPhrases));
    return this;
  }

  /**
   * Wait to recieve a text message from bot
   */
  public expectImage(url: string): this {
    this.addRespone(new Responses.ImageResponse(url));
    return this;
  }

  /**
   * Wait to recieve a set of buttons from bot
   * @todo create a better inirializer to create button object
   * @param text Text for the button message to have
   * @param button Array of raw button strctures
   */
  public expectButtons(text: string, button: Array<Button>): this {
    this.addRespone(new Responses.ButtonTemplateResponse([text], button));
    return this;
  }
  /**
   * During development cam be used to pause the debuger and check input
   */
  public debugBreak() {
    const savedThis = this;
    this.promiseChain = this.promiseChain.then(function(): void {
      if (process.env.NODE_ENV !== 'production') {
      // tslint:disable-next-line:no-debugger
        debugger;
      }
      return null;
    }.bind(savedThis));
    return this;
  }
  /**
   * Send a string as the user to the bot
   */
  public sendText(text: string): this {
    const message: TextMessage = {
      type: 'text',
      text: text,
      id: uuid.v4(),
      conversation_id: this.userId,
    };
    this.addSend(message);
    return this;
  }

  /**
   *  Send a postback button click as the user to the bot with specififed payload
   */
  public sendButtonClick(payload: string): this {
    const message: PostbackMessage = {
      type: 'postback',
      payload: payload,
      id: uuid.v4(),
      conversation_id: this.userId,
    };
    this.addSend(message);
    return this;
  }

  /**
   * Guard to protect user from forgetting to call run() at end of test
   * @todo automatically call run()
   * @private
   */
  public then(...args: any[]) {
    throw new Error('Need to call .run() at end of script');
  }

  /**
   * Called to start test
   */
  public run(): Promise<any> {
    const savedThis = this;
    if (this.checkforExtraDialogs) {
      this.promiseChain = this.promiseChain.then(() => {
        const waitPromise = new Promise((resolve, reject) => {
          savedThis.timeoutReject = reject;
        });
        return  waitPromise.timeout(this.timeout)
          // ignore timeout error
          .catch(Promise.TimeoutError, (err: Error) => ({}));
      });
    }
    this.startTest();
    return this.promiseChain;
  }

  /**
   * If set to true, will wait for any extra messages not in test script and fail test
   */
  public checkForTrailingDialogs(bool: boolean = true): this {
    this.checkforExtraDialogs = bool;
    return this;
  }

  /**
   * Private function to recieve messages from the test platform
   * @private
   */
  public receive<M extends Message>(message: M): void {
    if (this.currentExpect) {
      try {
        this.currentExpect.check(message);
        this.currentExpect = null;
        this.currentResolve();
      } catch (err) {
        this.currentReject(err);
      }
      return;
    }
    // console.error('Got a message but didn\'t expect one', message, this.timeoutReject);
    if (this.timeoutReject) {
      this.timeoutReject(new Error('Got an extra message: ' + util.inspect(message) ));
    }
  }

  /**
   * Private function to recieve errors from test platform
   * @private
   */
  public onError(err: Error) {
    console.error('huh?, onError called');
    throw err;
  }
}
