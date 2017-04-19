/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Message } from '../types/message';
import { Button } from '../types/messages/button';
import TestPlatform from './platform';
export default class Tester {
    readonly userId: string;
    private testPlatfom;
    private promiseChain;
    private currentResolve;
    private currentReject;
    private currentExpect;
    private startTest;
    private timeoutReject;
    private timeout;
    private checkforExtraDialogs;
    constructor(platform: TestPlatform, userId?: string);
    /**
     * Add a promise to the chain to expect a response from the bot
     */
    private addRespone(expectChecker);
    /**
     * Add a promise to chain to send amessage to the bot
     */
    private addSend(message);
    /**
     * Wait to recieve a text message from bot
     */
    expectText(allowedPhrases: Array<string> | string): this;
    /**
     * Wait to recieve a text message from bot
     */
    expectImage(url: string): this;
    /**
     * Wait to recieve a set of buttons from bot
     * @todo create a better inirializer to create button object
     * @param text Text for the button message to have
     * @param button Array of raw button strctures
     */
    expectButtons(text: string, button: Array<Button>): this;
    /**
     * During development cam be used to pause the debuger and check input
     */
    debugBreak(): this;
    /**
     * Send a string as the user to the bot
     */
    sendText(text: string): this;
    /**
     *  Send a postback button click as the user to the bot with specififed payload
     */
    sendButtonClick(payload: string): this;
    /**
     * Guard to protect user from forgetting to call run() at end of test
     * @todo automatically call run()
     * @private
     */
    then(...args: any[]): void;
    /**
     * Called to start test
     */
    run(): Promise<any>;
    /**
     * If set to true, will wait for any extra messages not in test script and fail test
     */
    checkForTrailingDialogs(bool?: boolean): this;
    /**
     * Private function to recieve messages from the test platform
     * @private
     */
    receive<M extends Message>(message: M): void;
    /**
     * Private function to recieve errors from test platform
     * @private
     */
    onError(err: Error): void;
}
