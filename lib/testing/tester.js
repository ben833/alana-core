"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var Promise = require("bluebird");
var util = require("util");
var uuid = require("uuid");
var Responses = require("./responses");
var Tester = (function () {
    function Tester(platform, userId) {
        if (userId === void 0) { userId = "test-" + _.random(999999); }
        var _this = this;
        this.currentExpect = null;
        this.timeout = 20;
        this.checkforExtraDialogs = false;
        this.testPlatfom = platform;
        this.userId = userId;
        this.promiseChain = new Promise(function (resolve, reject) {
            _this.startTest = resolve;
        });
        var greeting = {
            type: 'greeting',
            id: uuid.v4(),
            conversation_id: userId,
        };
        this.addSend(greeting);
    }
    /**
     * Add a promise to the chain to expect a response from the bot
     */
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
    /**
     * Add a promise to chain to send amessage to the bot
     */
    Tester.prototype.addSend = function (message) {
        var _this = this;
        var savedThis = this;
        this.promiseChain = this.promiseChain.then(function () {
            savedThis.testPlatfom.receive(_this.userId, message);
            return null;
        });
        return this;
    };
    /**
     * Wait to recieve a text message from bot
     */
    Tester.prototype.expectText = function (allowedPhrases) {
        this.addRespone(new Responses.TextResponse(allowedPhrases));
        return this;
    };
    /**
     * Wait to recieve a text message from bot
     */
    Tester.prototype.expectImage = function (url) {
        this.addRespone(new Responses.ImageResponse(url));
        return this;
    };
    /**
     * Wait to recieve a set of buttons from bot
     * @todo create a better inirializer to create button object
     * @param text Text for the button message to have
     * @param button Array of raw button strctures
     */
    Tester.prototype.expectButtons = function (text, button) {
        this.addRespone(new Responses.ButtonTemplateResponse([text], button));
        return this;
    };
    /**
     * During development cam be used to pause the debuger and check input
     */
    Tester.prototype.debugBreak = function () {
        var savedThis = this;
        this.promiseChain = this.promiseChain.then(function () {
            if (process.env.NODE_ENV !== 'production') {
                // tslint:disable-next-line:no-debugger
                debugger;
            }
            return null;
        }.bind(savedThis));
        return this;
    };
    /**
     * Send a string as the user to the bot
     */
    Tester.prototype.sendText = function (text) {
        var message = {
            type: 'text',
            text: text,
            id: uuid.v4(),
            conversation_id: this.userId,
        };
        this.addSend(message);
        return this;
    };
    /**
     *  Send a postback button click as the user to the bot with specififed payload
     */
    Tester.prototype.sendButtonClick = function (payload) {
        var message = {
            type: 'postback',
            payload: payload,
            id: uuid.v4(),
            conversation_id: this.userId,
        };
        this.addSend(message);
        return this;
    };
    /**
     * Guard to protect user from forgetting to call run() at end of test
     * @todo automatically call run()
     * @private
     */
    Tester.prototype.then = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        throw new Error('Need to call .run() at end of script');
    };
    /**
     * Called to start test
     */
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
    /**
     * If set to true, will wait for any extra messages not in test script and fail test
     */
    Tester.prototype.checkForTrailingDialogs = function (bool) {
        if (bool === void 0) { bool = true; }
        this.checkforExtraDialogs = bool;
        return this;
    };
    /**
     * Private function to recieve messages from the test platform
     * @private
     */
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
        // console.error('Got a message but didn\'t expect one', message, this.timeoutReject);
        if (this.timeoutReject) {
            this.timeoutReject(new Error('Got an extra message: ' + util.inspect(message)));
        }
    };
    /**
     * Private function to recieve errors from test platform
     * @private
     */
    Tester.prototype.onError = function (err) {
        console.error('huh?, onError called');
        throw err;
    };
    return Tester;
}());
exports.default = Tester;
//# sourceMappingURL=tester.js.map