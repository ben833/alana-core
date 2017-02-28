/// <reference types="bluebird" />
import { User } from './types/user';
import * as Messages from './types/message';
import ButtonClass from './outgoing/button';
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
    startTyping(): void;
    endTyping(): void;
    sendText(text: string): this;
    sendImage(url: string): this;
    sendButtons(): ButtonClass;
    sendButtons(message: Messages.ButtonMessage): this;
    sendAudio(url: string): this;
    private _send(message);
}
