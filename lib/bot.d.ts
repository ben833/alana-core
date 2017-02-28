/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { PlatformMiddleware } from './types/platform';
import { Intent, IncomingMessage, IntentGenerator, ReducerFunction, GreetingFunction, DialogFunction } from './types/bot';
import { UserMiddleware, User, BasicUser } from './types/user';
export { TopicCollection } from './nlp/classifier';
export { Intent, PlatformMiddleware };
import Script from './script';
export default class Botler {
    debugOn: Boolean;
    private intents;
    private reducer;
    userMiddleware: UserMiddleware;
    private platforms;
    private _scripts;
    private greetingScript;
    onErrorScript: DialogFunction;
    constructor(classifierFile?: string);
    addIntent(newIntent: IntentGenerator): this;
    unshiftIntent(newIntent: IntentGenerator): this;
    newScript(name?: string): Script;
    getScript(name?: string): Script;
    readonly scripts: string[];
    addGreeting(script: GreetingFunction): this;
    setReducer(newReducer: ReducerFunction): this;
    setUserMiddlware(middleware: UserMiddleware): this;
    addPlatform(platform: PlatformMiddleware): this;
    addErrorHandler(dialog: DialogFunction): this;
    turnOnDebug(): this;
    createEmptyIntent(): Intent;
    createEmptyUser(defaults?: any): User;
    start(): void;
    stop(): void;
    processGreeting(user: BasicUser): Promise<void>;
    processMessage(basicUser: BasicUser, message: IncomingMessage): Promise<void>;
    private getIntents(user, message);
    private _process(user, request, response, directCall?);
}
