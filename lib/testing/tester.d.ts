/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Message } from '../types/message';
import { Button } from '../types/messages/button';
import TestPlatform from './platform';
export declare enum TestState {
    notStarted = 0,
    running = 1,
    error = 2,
    done = 3,
}
export default class Tester {
    userId: string;
    private testPlatfom;
    private promiseChain;
    private currentResolve;
    private currentReject;
    private currentExpect;
    private startTest;
    private timeoutReject;
    private state;
    private timeout;
    private timer;
    private checkforExtraDialogs;
    constructor(platform: TestPlatform, userId?: string);
    private addRespone(expectChecker);
    private addSend(message);
    expectText(allowedPhrases: Array<string> | string): this;
    expectButtons(text: string, button: Array<Button>): this;
    debugBreak(): this;
    /**
     * Send a string as the user
     * @param text string to send
     */
    sendText(text: string): this;
    sendButtonClick(payload: string): this;
    then(...args: any[]): void;
    run(): Promise<any>;
    checkForTrailingDialogs(bool?: boolean): this;
    receive<M extends Message>(message: M): void;
    onError(err: Error): void;
}
