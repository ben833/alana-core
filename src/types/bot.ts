import { User } from './user';
import * as Promise from 'bluebird';
import { IncomingMessage } from './message';
import Outgoing from '../outgoing';

export interface Intent {
  action: string;
  domain: string;
  details: {
    confidence: number;
  } | any;
}

export { IncomingMessage };
export interface InternalMessageDetails {
  _eaten: boolean;
}

export interface Incoming {
    user: User;
    message: IncomingMessage & InternalMessageDetails;
    intent: Intent;
};

import * as Message from './message';
export { Message };

export type StopFunction = () => void;
export type DialogFunction = (incoming: Incoming, response: Outgoing, stop: StopFunction) => Promise<void>;
export type GreetingFunction = (user: User, response: Outgoing) => Promise<void>;

export declare class IntentGenerator {
    public getIntents: (message: IncomingMessage, user: User) => Promise<Array<Intent>>;
}

export interface SkillFunction {
  (user: User): Promise<User>;
}

export interface ReducerFunction {
  (intents: Array<Intent>, user?: User): Promise<Intent>;
}

export interface Logger {
    error(message?: any, ...optionalParams: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    log(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
}
