import * as Promise from 'bluebird';
import { Message, OutgoingMessage } from './message';
import { User } from './user';

// Platform middlware
export declare class PlatformMiddleware {
    public start: () => Promise<this>;
    public stop: () => Promise<this>;
    public send: <U extends User>(user: U, message: OutgoingMessage) => Promise<this>;
}
