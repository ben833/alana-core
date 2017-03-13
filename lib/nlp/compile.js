"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var classifier_1 = require("./classifier");
// tslint:disable-next-line:no-var-requires
var intents = require('@alana/intents');
classifier_1.GenerateClassifier([path.join(require.resolve('@alana/intents'), '..', intents.intents)], __dirname + "/../../nlp/classifiers.json");
//# sourceMappingURL=compile.js.map