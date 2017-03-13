/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { PlatformMiddleware } from './types/platform';
import { Intent, IncomingMessage, IntentGenerator, ReducerFunction, GreetingFunction, DialogFunction } from './types/bot';
import { UserMiddleware, User, BasicUser } from './types/user';
export { TopicCollection } from './nlp/classifier';
export { Intent, PlatformMiddleware };
import Script from './scripting/script';
export default class Alana {
    debugOn: Boolean;
    private intents;
    private reducer;
    userMiddleware: UserMiddleware;
    private platforms;
    private _scripts;
    private greetingScript;
    onErrorScript: DialogFunction;
    private serializedMessages;
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
    processMessage(basicUser: BasicUser, message: IncomingMessage): Promise<void>;
    private _processMessage(basicUser, message);
    private getIntents(user, message);
    /**
     * @private
     * @param user The user initiating the chat
     * @param request All the incoming information about the current sessiom
     * @param response Class used to send responses back to the user
     * @param directCall True if being called by process(...) otherwise set to false to stop infinite loops
     */
    private _process(user, request, response, directCall?);
}
