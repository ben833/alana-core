import * as _ from 'lodash';
import * as Promise from 'bluebird';
import * as util from 'util';

import { Incoming, DialogFunction } from '../types/bot';
import { MessageType, MessageTypes } from '../types/message';
import { MinimalScriptActions, ExpectInput, IntentAlways, DialogInput, DialogAction, ButtonInput } from '../types/script';
import Outgoing from '../outgoing';

import Botler from '../bot';
import Expect from './expect';
import Text from './text';
import Button from './button';
import Intent from './intent';
import Match from './match';
import Dialog from './dialog';

export enum StopScriptReasons {
  Called,
  NewScript,
  ExpectCaught,
}

export class StopException extends Error {
  public reason: StopScriptReasons;
  constructor(reason: StopScriptReasons) {
    super(`Script stopped due to ${StopScriptReasons[reason]}`);
    // Set the prototype explicitly.
    (<any> Object).setPrototypeOf(this, StopException.prototype);
    this.reason = reason;
  }
}

export enum EndScriptReasons {
  Called,
  Reached,
}

export class EndScriptException extends Error {
  public reason: EndScriptReasons;
  constructor(reason: EndScriptReasons) {
    super(`End of script due to ${EndScriptReasons[reason]}`);
    // Set the prototype explicitly.
    (<any> Object).setPrototypeOf(this, EndScriptException.prototype);
    this.reason = reason;
  }
}

export class GotoDialogException extends Error {
  public dialogName: string;
  constructor(dialogName: string) {
    super(`Go to script named ${dialogName}`);
    // Set the prototype explicitly.
    (<any> Object).setPrototypeOf(this, GotoDialogException.prototype);
    this.dialogName = dialogName;
  }
}

export default class Script implements MinimalScriptActions {
  private dialogs: Array<DialogAction> = [];
  private name: string;
  private bot: Botler;
  // tslint:disable-next-line:variable-name
  private _begin: DialogFunction = null;
  public expect: ExpectInput;
  public intent: IntentAlways<this>;
  public dialog: DialogInput;
  public button: ButtonInput;

  constructor(bot: Botler, scriptName: string) {
    this.bot = bot;
    this.name = scriptName;
    this.intent = this._intent.bind(this);
    this.intent.always = this._intentAlways.bind(this);
    this.dialog = this._dialog.bind(this);
    this.dialog.always = this._dialogAlways.bind(this);
    this.expect = this.completedExpect.bind(this);
    this.expect.text = this.expectText.bind(this);
    this.expect.button = this.expectButton.bind(this);
    this.expect.intent = this.expectIntent.bind(this);
    this.expect.match = this.expectMatch.bind(this);
    this.expect.catch = this.expectCatch.bind(this);
    this.button = this._button.bind(this);
    this.button.always = this._buttonAlways.bind(this);
    return this;
  }

  private expectText() {
    const e = new Expect(this);
    this.dialogs.push(e);
    e.text.apply(e, arguments);
    return e;
  }

  private expectButton() {
    const e = new Expect(this);
    this.dialogs.push(e);
    e.button.apply(e, arguments);
    return e;
  }

  private expectIntent() {
    const e = new Expect(this);
    this.dialogs.push(e);
    e.intent.apply(e, arguments);
    return e;
  }

  private expectMatch() {
    const e = new Expect(this);
    this.dialogs.push(e);
    e.match.apply(e, arguments);
    return e;
  }

  private expectCatch() {
    const e = new Expect(this);
    this.dialogs.push(e);
    e.catch.apply(e, arguments);
    return e;
  }

  private completedExpect(fn: DialogFunction): this {
    const e = new Expect(this);
    this.dialogs.push(e);
    e.catch(fn);
    return this;
  }

  get length(): number {
    return this.dialogs.length;
  }

  public run(incoming: Incoming, outgoing: Outgoing, nextScript: () => Promise<void>, step: number = incoming.user.scriptStage, skipAlways: boolean = false) {
    const topic = incoming.intent.domain;
    const action = incoming.intent.action;

    const top = _.slice(this.dialogs, 0, Math.max(0, step));
    const bottom = _.slice(this.dialogs, Math.max(0, step));

    let validDialogs: Array<DialogAction> = bottom;
    let forcedDialogs: Array<DialogAction> = top.filter((shell) => shell.always);

    if (skipAlways) {
      forcedDialogs = [];
    }
    const runUnforced = () => {
      return Promise.resolve()
        .then(() => {
          return this.callScript(incoming, outgoing, validDialogs, nextScript, Math.max(step, 0));
        });
    };
    return Promise.resolve()
      .then(() => {
        if (step === -1) {
          incoming.user.scriptStage = 0;
          if (this._begin !== null) {
            return this._begin(incoming, outgoing, stopFunction);
          }
        }
      })
      .then(() => {
        return this.callScript(incoming, outgoing, forcedDialogs, runUnforced, 0);
      });
  }

  public begin(dialogFunction: DialogFunction): this {
    this._begin = dialogFunction;
    return this;
  }

  public _dialog(dialogFunction: DialogFunction): this;
  public _dialog(name: string, dialogFunction: DialogFunction): this;
  public _dialog(): this {
    let dialog: Dialog;
    switch (arguments.length) {
      case 1:
        dialog = new Dialog(arguments[0]);
        break;
      case 2:
        dialog = new Dialog(arguments[1], arguments[0]);
        break;
      default:
        throw new Error('dialog called incorrectly');
    }
    this.dialogs.push(dialog);
    return this;
  }

  private _dialogAlways() {
    this._dialog.apply(this, arguments);
    _.last(this.dialogs).always = true;
    return this;
  }

  private _intent(topic: string, dialogFunction: DialogFunction): this;
  private _intent(topic: string, action: string, dialogFunction: DialogFunction): this;
  private _intent(): this {
    let intent: Intent;
    switch (arguments.length) {
      case 2:
        intent = new Intent(arguments[1], arguments[0]);
        break;

      case 3:
        intent = new Intent(arguments[2], arguments[0], arguments[1]);
        break;

      default:
        throw new Error('Incorect argument count');
    }
    this.dialogs.push(intent);
    return this;
  }

  private _intentAlways() {
    this._intent.apply(this, arguments);
    _.last(this.dialogs).always = true;
    return this;
  }

  private _button(dialogFunction: DialogFunction): this;
  private _button(postback: string, dialogFunction: DialogFunction): this;
  private _button(): this {
    let button: Button;
    switch (arguments.length) {
      case 1:
        button = new Button(arguments[0]);
        break;

      case 2:
        button = new Button(arguments[1], arguments[0]);
        break;

      default:
        throw new Error('bad arguments');
    }

    this.dialogs.push(button);
    return this;
  }

  private _buttonAlways(): this {
    this._button.apply(this, arguments);
    _.last(this.dialogs).always = true;
    return this;
  }

  private callScript(request: Incoming, response: Outgoing, dialogs: Array<DialogAction>, nextScript: () => Promise<void>, thisStep: number): Promise<void> {
    if (dialogs.length === 0) {
      return nextScript();
    }

    const currentDialog = _.head(dialogs);
    const nextDialogs = _.tail(dialogs);

    // tslint:disable-next-line:variable-name
    const __this = this;
    return Promise.resolve()
      .then(() => {
        // Should the bot process the message, is there a match with current message?
        const fn = currentDialog.process(request);
        if (fn !== null && currentDialog.consumesMessage && request.message._eaten) {
          throw new StopException(StopScriptReasons.ExpectCaught);
        }
        return fn;
      })
      .then((dialog: DialogFunction) => {
        if (dialog === null) {
          return;
        }
        if (currentDialog.consumesMessage) {
          request.message._eaten = true;
        }
        return dialog(request, response, stopFunction);
      })
      .then(() => {
        request.user.scriptStage = Math.max(request.user.scriptStage, thisStep + 1);
        if (nextDialogs.length === 0) {
          // throw new EndScriptException(EndScriptReasons.Reached);
          return nextScript();
        }
        const dialog = _.head(nextDialogs);
        if (dialog.blocking === false) {
          return __this.callScript(request, response, nextDialogs, nextScript, thisStep + 1);
        }
      })
      .catch((err: Error) => {
        if (err instanceof GotoDialogException) {
          for (let i = 0; i < this.dialogs.length; i++) {
            const dialog = this.dialogs[i];
            if (dialog instanceof Dialog && dialog.name === err.dialogName) {
              request.user.scriptStage = i;
              return this.run(request, response, nextScript, i, true);
            }
          }
        }
        // pass it up the chain
        throw err;
      });
  }
}

export function stopFunction(reason: StopScriptReasons = StopScriptReasons.Called) {
  throw new StopException(reason);
}
