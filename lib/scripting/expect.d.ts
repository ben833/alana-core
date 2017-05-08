import { MinimalScriptActions, ExpectInput, DialogInput, DialogAction, Incoming, DialogFunction } from '../types/script';
import Script from './script';
export declare type PublicMembers = ExpectInput & MinimalScriptActions;
export default class Expect extends DialogAction implements PublicMembers {
    private myScript;
    private guid;
    private expects;
    private catchFn;
    dialog: DialogInput;
    expect: ExpectInput;
    blocking: boolean;
    consumesMessage: boolean;
    constructor(script: Script);
    text(dialogFunction: DialogFunction): this;
    button(dialogFunction: DialogFunction): this;
    button(postback: string, dialogFunction: DialogFunction): this;
    intent(domian: string, fn: DialogFunction): this;
    intent(domian: string, action: string, fn: DialogFunction): this;
    match(pattern: string | RegExp, dialogFunction: DialogFunction): this;
    catch(dialogFunction: DialogFunction): Script;
    process(request: Incoming): DialogFunction;
}
