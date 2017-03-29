/// <reference types="bluebird" />
import { User } from './types/user';
import * as Messages from './types/message';
import ButtonClass from './outgoing-class/button';
import { PlatformMiddleware } from './types/platform';
import * as Promise from 'bluebird';
import Botler from './bot';
export default class Outgoing {
    promise: Promise<PlatformMiddleware>;
    protected user: User;
    protected bot: Botler;
    constructor(bot: Botler, user: User);
    startScript(name?: string, scriptArguments?: any): void;
    endScript(): void;
    goto(dialogName: string): void;
    startTyping(): void;
    endTyping(): void;
    send(text: string): this;
    sendText(text: string): this;
    sendImage(url: string): this;
    sendButtons(message: Messages.ButtonMessage): this;
    createButtons(): ButtonClass;
    sendAudio(url: string): this;
    private _send(message);
}
