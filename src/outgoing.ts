import { User } from './types/user';
import * as Messages from './types/message';
import ButtonClass from './outgoing/button';
import { PlatformMiddleware } from './types/platform';
import * as Promise from 'bluebird';
import Botler from './bot';
import * as _ from 'lodash';
import { stopFunction, EndScriptException, EndScriptReasons, StopScriptReasons } from './script';

export default class Outgoing {
  public promise: Promise<PlatformMiddleware> = Promise.resolve(null);
  protected user: User;
  protected bot: Botler;
  constructor(bot: Botler, user: User) {
    this.bot = bot;
    this.user = user;
    return this;
  }

  public startScript(name: string = '', scriptArguments: any = {}) {
    this.user.script = name;
    this.user.scriptStage = -1;
    this.user.scriptArguments = scriptArguments;
    stopFunction(StopScriptReasons.NewScript);
  }

  public endScript() {
    throw new EndScriptException(EndScriptReasons.Called);
  }

  public startTyping() {
      throw new Error('not implemented');
  }

  public endTyping() {
      throw new Error('not implemented');
  }

  public sendText(text: string) {
    const textMessage: Messages.TextMessage = {
      type: 'text',
      text: text,
    };
    return this._send(textMessage);
  }

  public sendImage(url: string) {
    const message: Messages.ImageMessage = {
      type: 'image',
      url: url,
    };
    return this._send(message);
  }

  public sendButtons(): ButtonClass;
  public sendButtons(message: Messages.ButtonMessage): this;
  public sendButtons() {
    if (arguments.length === 0) {
      return new ButtonClass(this);
    } else {
      return this._send(arguments[0]);
    }
  }

  public sendAudio(url: string) {
    const message: Messages.AudioMessage = {
      type: 'audio',
      url: url,
    };
    return this._send(message);
  }

  private _send(message: Messages.Message): this {
    this.promise = this.promise
      .then(() => this.user._platform.send(this.user, message))
      .catch((err: Error) => {
        console.log('Error sending message to user', err);
      });
    return this;
  }
}
