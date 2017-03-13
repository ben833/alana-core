import * as path from 'path';
import { GenerateClassifier } from './classifier';

// tslint:disable-next-line:no-var-requires
const intents = require('@alana/intents');

GenerateClassifier([path.join(require.resolve('@alana/intents'), '..', intents.intents)], `${__dirname}/../../nlp/classifiers.json`);
