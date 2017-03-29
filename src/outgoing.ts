import { User } from './types/user';
import * as Messages from './types/message';
import { OutgoingMessage } from './types/message';
import ButtonClass from './outgoing-class/button';
import { PlatformMiddleware } from './types/platform';
import * as Promise from 'bluebird';
import Botler from './bot';
import * as _ from 'lodash';
import { stopFunction, EndScriptException, EndScriptReasons, StopScriptReasons, GotoDialogException } from './scripting/script';
import { MissingArguments, BadArguments } from './errors';

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

  public goto(dialogName: string): void {
    throw new GotoDialogException(dialogName);
  }

  public startTyping() {
      throw new Error('not implemented');
  }

  public endTyping() {
      throw new Error('not implemented');
  }

  public send(text: string): this;
  public send(...args: any[]) {
    if (arguments.length === 0) {
      throw new MissingArguments();
    }
    if (arguments.length === 1) {
      const arg = arguments[0];
      if (_.isString(arg)) {
        return this.sendText(arg);
      }
    }
    throw new BadArguments();
  }

  public sendText(text: string) {
    if (typeof text === 'undefined') {
      throw new BadArguments('Got undefined');
    }
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

  public sendButtons(message: Messages.ButtonMessage): this {
    return this._send(message);
  }

  public createButtons(): ButtonClass {
    return new ButtonClass(this);
  }

  public sendAudio(url: string) {
    const message: Messages.AudioMessage = {
      type: 'audio',
      url: url,
    };
    return this._send(message);
  }

  private _send(message: OutgoingMessage): this {
    this.promise = this.promise
      .then(() => this.user._platform.send(this.user, message))
      .catch((err: Error) => {
        this.bot.logger.error('Error sending message to user', err);
      });
    return this;
  }
}
