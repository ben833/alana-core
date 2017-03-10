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
  private script: Array<Responses.Response | IncomingMessage> = [ greetingMessage ];
  private testPlatfom: TestPlatform;
  private step: number = 0;
  private thePromise: Promise<void>;
  private publicPromise: Promise<any>;
  private resolve: () => void;
  private reject: (err?: Error) =>  void;
  private state: TestState = TestState.notStarted;
  private timeout: number = 20;
  private timer: any;
  private checkforExtraDialogs: boolean = true;

  constructor(platform: TestPlatform, userId: string = `test-${_.random(999999)}`) {
    this.testPlatfom = platform;
    this.userId = userId;
    this.thePromise = Promise.resolve()
      .catch((err: Error) => {
        console.error('check failed');
        this.reject(err);
        this.reject = null;
      });
  }

  public expectText(allowedPhrases: Array<string> | string): this {
    this.script.push(new Responses.TextResponse(allowedPhrases));
    return this;
  }

  public expectButtons(text: string, button: Array<Button>): this {
    this.script.push(new Responses.ButtonTemplateResponse([text], button));
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
    this.script.push(message);
    return this;
  }

  public sendButtonClick(payload: string): this {
    const message: PostbackMessage = {
      type: 'postback',
      payload: payload,
    };
    this.script.push(message);
    return this;
  }

  public then(...args: any[]) {
    throw new Error('Need to call .run() at end of script');
  }

  public run(): Promise<any> {
    const savedThis = this;
    return new Promise(function(resolve, reject) {
      savedThis.resolve = resolve;
      savedThis.reject = reject;
      savedThis.execute();
    });
  }

  public checkForTrailingDialogs(bool: boolean): this {
    this.checkforExtraDialogs = bool;
    return this;
  }

  private execute(): void {
    console.log('execute', this.script);
    let i = this.step;
    for (i; i < this.script.length; i++) {
      const nextStep = this.script[i];
      console.log('step', nextStep);
      if (nextStep instanceof Responses.Response) {
        // console.log('wait for message from test script...');
        return;
      } else {
        console.log('send next step');
        this.step = this.step + 1;
        console.log(this.script[this.step]);
        this.thePromise = this.thePromise.then(() => this.testPlatfom.receive(this.userId, nextStep));
        return;
      }
    }

    if (this.step >= this.script.length) {
      const savedThis = this;
      if (this.checkforExtraDialogs === false) {
        savedThis.resolve();
        return;
      }
      this.timer = setTimeout(function() {
        if (savedThis.state !== TestState.error) {
          savedThis.resolve();
        }
      }, this.timeout);
    }
  }

  public receive<M extends Message>(message: M): void {
    // console.log(`receive... ${this.step} of ${this.script.length}`, message);
    if (this.step >= this.script.length) {
      this.state = TestState.error;
      const err = new Error(`received '${util.inspect(message)}' after script completed`);
      if (this.reject) {
        this.reject(err);
        this.reject = null;
      }
      return;
    }

    const currentStep = this.script[this.step];
    if (currentStep instanceof Responses.Response) {
      // console.log('checking...');
      try {
        currentStep.check(message);
      } catch (err) {
        // console.log('check failed...');
        if (this.reject) {
          this.reject(err);
          this.reject = null;
        }
        return;
      }
      this.step = this.step + 1;
      this.execute();
      return;
    }
  }

  public onError(err: Error) {
    if (this.state === TestState.error) {
      return;
    }
    if (!this.reject) {
      console.error('no reject function yet');
      throw new Error('no reject function yet');
    }
    this.state = TestState.error;
    this.reject(err);
  }
}
