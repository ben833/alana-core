/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Incoming, DialogFunction } from './types/bot';
import Outgoing from './outgoing';
import Botler from './bot';
export declare enum StopScriptReasons {
    Called = 0,
    NewScript = 1,
    ExpectCaught = 2,
}
export declare class StopException extends Error {
    reason: StopScriptReasons;
    constructor(reason: StopScriptReasons);
}
export declare enum EndScriptReasons {
    Called = 0,
    Reached = 1,
}
export declare class EndScriptException extends Error {
    reason: EndScriptReasons;
    constructor(reason: EndScriptReasons);
}
export declare class GotoDialogException extends Error {
    dialogName: string;
    constructor(dialogName: string);
}
export declare type FunctionShell = {
    (...args: any[]): (...args: any[]) => this;
};
export declare type DotAlways = {
    always: (...args: any[]) => this;
};
export declare type ExpectButton = (dialogFunction: DialogFunction) => this;
export declare type ExpectButtonWith = (postback: string, dialogFunction: DialogFunction) => this;
export declare type ExpectInput = {
    (...args: any[]): (...args: any[]) => this;
    text: (dialogFunction: DialogFunction) => this;
    button: ExpectButton | ExpectButtonWith;
};
export declare type DialogHandler = DialogNamed | DialogSimple;
export declare type DialogSimple = (fn: DialogFunction) => Script;
export declare type DialogNamed = (name: string, fn: DialogFunction) => Script;
export default class Script {
    private dialogs;
    private name;
    private bot;
    private _begin;
    button: FunctionShell & DotAlways;
    expect: ExpectInput;
    intent: FunctionShell & DotAlways;
    dialog: DialogHandler & DotAlways;
    constructor(bot: Botler, scriptName: string);
    readonly length: number;
    run(incoming: Incoming, outgoing: Outgoing, nextScript: () => Promise<void>, step?: number): Promise<void>;
    begin(dialogFunction: DialogFunction): this;
    _dialog(dialogFunction: DialogFunction): this;
    _dialog(name: string, dialogFunction: DialogFunction): this;
    private _expect(type, dialogFunction);
    private expectText(dialogFunction);
    catch(dialogFunction: DialogFunction): this;
    private _intent(dialogFunction);
    private _intent(topic, dialogFunction);
    private _intent(topic, action, dialogFunction);
    private _intentAlways();
    private _dialogAlways();
    private _button(dialogFunction);
    private _button(postback, dialogFunction);
    private _buttonAlways();
    private _buttonExpect(dialogFunction);
    private _buttonExpect(postback, dialogFunction);
    private filterDialog(topic, action);
    private callScript(request, response, dialogs, nextScript, thisStep);
}
export declare function stopFunction(reason?: StopScriptReasons): void;
