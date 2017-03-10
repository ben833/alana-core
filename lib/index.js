"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
try {
    // tslint:disable-next-line:no-var-requires
    require('source-map-support').install();
    // tslint:disable-next-line:no-empty
}
catch (err) { }
var platform_1 = require("./types/platform");
exports.PlatformMiddleware = platform_1.PlatformMiddleware;
var message_1 = require("./types/message");
exports.MessageTypes = message_1.MessageTypes;
var bot_1 = require("./bot");
exports.default = bot_1.default;
var platform_2 = require("./testing/platform");
exports.TestPlatform = platform_2.default;
//# sourceMappingURL=index.js.map