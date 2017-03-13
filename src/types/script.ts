import { Incoming, DialogFunction, StopFunction } from './bot';
import Outgoing from '../outgoing';
import Script from '../scripting/script';
import Expect from '../scripting/expect';
export { DialogFunction };
import * as Promise from 'bluebird';

export type ExpectButton = (dialogFunction: DialogFunction) => Expect;
export type ExpectButtonWith = (postback: string, dialogFunction: DialogFunction) => Expect;

export type IntentDomain<returns> = (domian: string, fn: DialogFunction) => returns;
export type IntentDomainAction<returns> = (domian: string, action: string, fn: DialogFunction) => returns;
export type IntentInput<returns> = (IntentDomain<returns> | IntentDomainAction<returns>);
export type IntentAlways<returns> = IntentInput<returns> & dotAlways<(IntentDomain<returns> | IntentDomainAction<returns>)>;

export type ExpectRaw = (dialogFunction: DialogFunction) => Expect;
export type ExpectInput = {
  text: (dialogFunction: DialogFunction) => Expect;
  button: ExpectButton | ExpectButtonWith;
  intent: IntentInput<Expect>;
  match: (patten: string | RegExp, dialogFunction: DialogFunction) => Expect;
  catch: (dialogFunction: DialogFunction) => Script
};

export type dotAlways<functions> = {
  always: functions;
};

export type DialogInput = (DialogNamed | DialogSimple) & dotAlways<(DialogNamed | DialogSimple)>;
export type DialogSimple = (fn: DialogFunction) => Script;
export type DialogNamed = (name: string, fn: DialogFunction) => Script;

export type ButtonInput = (ButtonSimple | ButtonDeclared) & dotAlways<(ButtonSimple | ButtonDeclared)>;
export type ButtonSimple = (fn: DialogFunction) => Script;
export type ButtonDeclared = (payload: string, fn: DialogFunction) => Script;

export interface MinimalScriptActions {
  dialog: DialogInput;
};

export { Incoming, Outgoing, StopFunction}
export abstract class DialogAction {
  public always: boolean = false;
  public blocking: boolean = false;
  public consumesMessage: boolean = false;
  public abstract process(request: Incoming): (DialogFunction | null);
}
