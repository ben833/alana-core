import * as _ from 'lodash';
import * as Promise from 'bluebird';
import * as util from 'util';

import * as Responses from './responses';
import { PlatformMiddleware } from '../types/platform';
import { IncomingMessage, Message, TextMessage, GreetingMessage, PostbackMessage } from '../types/message';
import { Button } from '../types/messages/button';
import { User } from '../types/user';
import TestPlatform from './platform';

const greetingMessage: GreetingMessage = {
  type: 'greeting',
};

export enum TestState {
  notStarted,
  running,
  error,
  done,
}

export default class Tester {
  public userId: string;
  private testPlatfom: TestPlatform;
  private promiseChain: Promise<any>;
  private currentResolve: () => void;
  private currentReject: (err?: Error) => void;
  private currentExpect: Responses.Response = null;
  private startTest: () => void;
  private timeoutReject: (err?: Error) => void;

  private state: TestState = TestState.notStarted;
  private timeout: number = 20;
  private timer: any;
  private checkforExtraDialogs: boolean = false;

  constructor(platform: TestPlatform, userId: string = `test-${_.random(999999)}`,) {
    this.testPlatfom = platform;
    this.userId = userId;

    this.promiseChain = new Promise((resolve, reject) => {
      this.startTest = resolve;
    });
    const greeting: GreetingMessage = {
      type: 'greeting',
    };
    this.addSend(greeting);
  }

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

  private addSend(message: any) {
    const savedThis = this;
    this.promiseChain = this.promiseChain.then(() => {
      savedThis.testPlatfom.receive(this.userId, message);
      return null;
    });
    return this;
  }

  public expectText(allowedPhrases: Array<string> | string): this {
    this.addRespone(new Responses.TextResponse(allowedPhrases));
    return this;
  }

  public expectButtons(text: string, button: Array<Button>): this {
    this.addRespone(new Responses.ButtonTemplateResponse([text], button));
    return this;
  }
  /**
   * Send a string as the user
   * @param text string to send
   */
  public sendText(text: string): this {
    const message: TextMessage = {
      type: 'text',
      text: text,
    };
    this.addSend(message);
    return this;
  }

  public sendButtonClick(payload: string): this {
    const message: PostbackMessage = {
      type: 'postback',
      payload: payload,
    };
    this.addSend(message);
    return this;
  }

  public then(...args: any[]) {
    throw new Error('Need to call .run() at end of script');
  }

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

  public checkForTrailingDialogs(bool: boolean = true): this {
    this.checkforExtraDialogs = bool;
    return this;
  }

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
    console.error('Got a message but didn\'t expect one', message, this.timeoutReject);
    if (this.timeoutReject) {
      this.timeoutReject(new Error('Got an extra message: ' + util.inspect(message) ));
    }
  }

  public onError(err: Error) {
    console.error('huh?, onError called');
  }
}
