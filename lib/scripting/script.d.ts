/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Incoming, DialogFunction } from '../types/bot';
import { MinimalScriptActions, ExpectInput, IntentAlways, DialogInput, ButtonInput } from '../types/script';
import Outgoing from '../outgoing';
import Botler from '../bot';
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
export default class Script implements MinimalScriptActions {
    private dialogs;
    private name;
    private bot;
    private _begin;
    expect: ExpectInput;
    intent: IntentAlways<this>;
    dialog: DialogInput;
    button: ButtonInput;
    constructor(bot: Botler, scriptName: string);
    private expectText();
    private expectButton();
    private expectIntent();
    private expectMatch();
    private expectCatch();
    private completedExpect(fn);
    readonly length: number;
    run(incoming: Incoming, outgoing: Outgoing, nextScript: () => Promise<void>, step?: number): Promise<void>;
    begin(dialogFunction: DialogFunction): this;
    _dialog(dialogFunction: DialogFunction): this;
    _dialog(name: string, dialogFunction: DialogFunction): this;
    private _dialogAlways();
    private _intent(topic, dialogFunction);
    private _intent(topic, action, dialogFunction);
    private _intentAlways();
    private _button(dialogFunction);
    private _button(postback, dialogFunction);
    private _buttonAlways();
    private callScript(request, response, dialogs, nextScript, thisStep);
}
export declare function stopFunction(reason?: StopScriptReasons): void;
