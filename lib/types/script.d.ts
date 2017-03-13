import { Incoming, DialogFunction, StopFunction } from './bot';
import Outgoing from '../outgoing';
import Script from '../scripting/script';
import Expect from '../scripting/expect';
export { DialogFunction };
export declare type ExpectButton = (dialogFunction: DialogFunction) => Expect;
export declare type ExpectButtonWith = (postback: string, dialogFunction: DialogFunction) => Expect;
export declare type IntentDomain<returns> = (domian: string, fn: DialogFunction) => returns;
export declare type IntentDomainAction<returns> = (domian: string, action: string, fn: DialogFunction) => returns;
export declare type IntentInput<returns> = (IntentDomain<returns> | IntentDomainAction<returns>);
export declare type IntentAlways<returns> = IntentInput<returns> & dotAlways<(IntentDomain<returns> | IntentDomainAction<returns>)>;
export declare type ExpectRaw = (dialogFunction: DialogFunction) => Expect;
export declare type ExpectInput = {
    text: (dialogFunction: DialogFunction) => Expect;
    button: ExpectButton | ExpectButtonWith;
    intent: IntentInput<Expect>;
    match: (patten: string | RegExp, dialogFunction: DialogFunction) => Expect;
    catch: (dialogFunction: DialogFunction) => Script;
};
export declare type dotAlways<functions> = {
    always: functions;
};
export declare type DialogInput = (DialogNamed | DialogSimple) & dotAlways<(DialogNamed | DialogSimple)>;
export declare type DialogSimple = (fn: DialogFunction) => Script;
export declare type DialogNamed = (name: string, fn: DialogFunction) => Script;
export declare type ButtonInput = (ButtonSimple | ButtonDeclared) & dotAlways<(ButtonSimple | ButtonDeclared)>;
export declare type ButtonSimple = (fn: DialogFunction) => Script;
export declare type ButtonDeclared = (payload: string, fn: DialogFunction) => Script;
export interface MinimalScriptActions {
    dialog: DialogInput;
}
export { Incoming, Outgoing, StopFunction };
export declare abstract class DialogAction {
    always: boolean;
    blocking: boolean;
    consumesMessage: boolean;
    abstract process(request: Incoming): (DialogFunction | null);
}
