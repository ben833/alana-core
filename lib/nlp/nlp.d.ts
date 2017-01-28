/// <reference types="bluebird" />
import { Classifiers } from './classifier';
import { Intent } from '../types/bot';
import { IncomingMessage } from '../types/bot';
import { IntentGenerator } from '../types/bot';
import * as Promise from 'bluebird';
export default class NLPBase implements IntentGenerator {
    classifiers: Classifiers;
    private components;
    constructor(classifierFile?: string);
    getIntents(message: IncomingMessage): Promise<Array<Intent>>;
    getTopics(): any;
}
export declare function baseBotTextNLP(text: string): Promise<Array<Intent>>;
export declare function locationNLP(text: string): Promise<Array<Intent>>;
