/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { OutgoingMessage } from './message';
import { User } from './user';
export declare class PlatformMiddleware {
    start: () => Promise<this>;
    stop: () => Promise<this>;
    send: <U extends User>(user: U, message: OutgoingMessage) => Promise<this>;
}
