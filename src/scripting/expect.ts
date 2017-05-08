import { MinimalScriptActions, ExpectInput, IntentInput, DialogInput, DialogAction, Incoming, Outgoing, DialogFunction, StopFunction } from '../types/script';
import Script from './script';
import Text from './text';
import Button from './button';
import Intent from './intent';
import Match from './match';

export type PublicMembers = ExpectInput & MinimalScriptActions;
export default class Expect extends DialogAction implements PublicMembers {
  private myScript: Script;
  private guid: number = Math.random();
  private expects: DialogAction[] = [];
  private catchFn: DialogFunction = null;
  public dialog: DialogInput;
  public expect: ExpectInput;
  public blocking: boolean = true;
  public consumesMessage: boolean = true;

  constructor(script: Script) {
    super();
    this.myScript = script;
    this.dialog = this.myScript.dialog.bind(this.myScript);
    this.dialog.always = this.myScript.dialog.always.bind(this.myScript);
    this.expect = this.myScript.expect;
  }

  public text(dialogFunction: DialogFunction) {
    const text: Text = new Text(dialogFunction);
    this.expects.push(text);
    return this;
  }

  public button(dialogFunction: DialogFunction): this;
  public button(postback: string, dialogFunction: DialogFunction): this;
  public button() {
    let button: Button;
    switch (arguments.length) {
      case 1:
        button = new Button(arguments[0]);
        break;
      case 2:
        button = new Button(arguments[1], arguments[0]);
        break;
      default:
        throw new Error('Exepct.button called incorrectly');
    }
    this.expects.push(button);
    return this;
  }

  public intent(domian: string, fn: DialogFunction): this;
  public intent(domian: string, action: string, fn: DialogFunction): this
  public intent() {
    let intent: Intent;
    switch (arguments.length) {
      case 2:
        intent = new Intent(arguments[1], arguments[0]);
        break;
      case 3:
        intent = new Intent(arguments[2], arguments[0], arguments[1]);
        break;
      default:
        throw new Error('Expect.intent called incorrectly');
    }
    this.expects.push(intent);
    return this;
  }

  public match(pattern: string | RegExp, dialogFunction: DialogFunction) {
    const match: Match = new Match(dialogFunction, pattern);
    this.expects.push(match);
    return this;
  }

  public catch(dialogFunction: DialogFunction) {
    this.catchFn = dialogFunction;
    return this.myScript;
  }

  public process(request: Incoming) {
    for (let i = 0; i < this.expects.length; i++) {
      const current = this.expects[i];
      const fn = current.process(request);
      if (fn !== null) {
        return fn;
      }
    }
    // nothing matched
    if (this.catchFn) {
      return this.catchFn;
    }
    return null;
  }

  // public _dialog() {
  //   return this.myScript.dialog.apply(this.myScript, arguments);
  // }
  // public _dialogAlways() {
  //   return this.myScript.dialog.always.apply(this.myScript, arguments);
  // }
}
