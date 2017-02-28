"use strict";
var _ = require("lodash");
var Promise = require("bluebird");
var tester_1 = require("./tester");
var TestPlatform = (function () {
    function TestPlatform(bot) {
        this.testers = {};
        this.bot = bot;
        return this;
    }
    TestPlatform.prototype.start = function () {
        return Promise.resolve(this);
    };
    TestPlatform.prototype.stop = function () {
        return Promise.resolve(this);
    };
    TestPlatform.prototype.send = function (user, message) {
        var test = this.testers[user.id];
        test.receive(message);
        return Promise.resolve(this);
    };
    TestPlatform.prototype.receive = function (userId, message) {
        var user = {
            id: userId,
            platform: 'testing',
            _platform: this,
        };
        return this.bot.processMessage(user, message);
    };
    TestPlatform.prototype.newTest = function (userId) {
        if (userId === void 0) { userId = "test-" + _.random(999999); }
        var instance = new tester_1.default(this, userId);
        this.testers[userId] = instance;
        return instance;
    };
    return TestPlatform;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestPlatform;
//# sourceMappingURL=platform.js.map