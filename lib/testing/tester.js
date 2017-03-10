"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var Promise = require("bluebird");
var util = require("util");
var Responses = require("./responses");
var greetingMessage = {
    type: 'greeting',
};
var TestState;
(function (TestState) {
    TestState[TestState["notStarted"] = 0] = "notStarted";
    TestState[TestState["running"] = 1] = "running";
    TestState[TestState["error"] = 2] = "error";
    TestState[TestState["done"] = 3] = "done";
})(TestState = exports.TestState || (exports.TestState = {}));
var Tester = (function () {
    function Tester(platform, userId) {
        if (userId === void 0) { userId = "test-" + _.random(999999); }
        var _this = this;
        this.currentExpect = null;
        this.state = TestState.notStarted;
        this.timeout = 20;
        this.checkforExtraDialogs = false;
        this.testPlatfom = platform;
        this.userId = userId;
        this.promiseChain = new Promise(function (resolve, reject) {
            _this.startTest = resolve;
        });
        var greeting = {
            type: 'greeting',
        };
        this.addSend(greeting);
    }
    Tester.prototype.addRespone = function (expectChecker) {
        var savedThis = this;
        this.promiseChain = this.promiseChain.then(function () {
            savedThis.currentExpect = expectChecker;
            var aPromise = new Promise(function (resolve, reject) {
                savedThis.currentResolve = resolve;
                savedThis.currentReject = reject;
            });
            return aPromise;
        });
        return this;
    };
    Tester.prototype.addSend = function (message) {
        var _this = this;
        var savedThis = this;
        this.promiseChain = this.promiseChain.then(function () {
            savedThis.testPlatfom.receive(_this.userId, message);
            return null;
        });
        return this;
    };
    Tester.prototype.expectText = function (allowedPhrases) {
        this.addRespone(new Responses.TextResponse(allowedPhrases));
        return this;
    };
    Tester.prototype.expectButtons = function (text, button) {
        this.addRespone(new Responses.ButtonTemplateResponse([text], button));
        return this;
    };
    /**
     * Send a string as the user
     * @param text string to send
     */
    Tester.prototype.sendText = function (text) {
        var message = {
            type: 'text',
            text: text,
        };
        this.addSend(message);
        return this;
    };
    Tester.prototype.sendButtonClick = function (payload) {
        var message = {
            type: 'postback',
            payload: payload,
        };
        this.addSend(message);
        return this;
    };
    Tester.prototype.then = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        throw new Error('Need to call .run() at end of script');
    };
    Tester.prototype.run = function () {
        var _this = this;
        var savedThis = this;
        if (this.checkforExtraDialogs) {
            this.promiseChain = this.promiseChain.then(function () {
                var waitPromise = new Promise(function (resolve, reject) {
                    savedThis.timeoutReject = reject;
                });
                return waitPromise.timeout(_this.timeout)
                    .catch(Promise.TimeoutError, function (err) { return ({}); });
            });
        }
        this.startTest();
        return this.promiseChain;
    };
    Tester.prototype.checkForTrailingDialogs = function (bool) {
        if (bool === void 0) { bool = true; }
        this.checkforExtraDialogs = bool;
        return this;
    };
    Tester.prototype.receive = function (message) {
        if (this.currentExpect) {
            try {
                this.currentExpect.check(message);
                this.currentExpect = null;
                this.currentResolve();
            }
            catch (err) {
                this.currentReject(err);
            }
            return;
        }
        console.error('Got a message but didn\'t expect one', message, this.timeoutReject);
        if (this.timeoutReject) {
            this.timeoutReject(new Error('Got an extra message: ' + util.inspect(message)));
        }
    };
    Tester.prototype.onError = function (err) {
        console.error('huh?, onError called');
    };
    return Tester;
}());
exports.default = Tester;
//# sourceMappingURL=tester.js.map