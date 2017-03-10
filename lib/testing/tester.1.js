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
        this.script = [greetingMessage];
        this.step = 0;
        this.state = TestState.notStarted;
        this.timeout = 20;
        this.checkforExtraDialogs = true;
        this.testPlatfom = platform;
        this.userId = userId;
        this.thePromise = Promise.resolve()
            .catch(function (err) {
            console.error('check failed');
            _this.reject(err);
            _this.reject = null;
        });
    }
    Tester.prototype.expectText = function (allowedPhrases) {
        this.script.push(new Responses.TextResponse(allowedPhrases));
        return this;
    };
    Tester.prototype.expectButtons = function (text, button) {
        this.script.push(new Responses.ButtonTemplateResponse([text], button));
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
        this.script.push(message);
        return this;
    };
    Tester.prototype.sendButtonClick = function (payload) {
        var message = {
            type: 'postback',
            payload: payload,
        };
        this.script.push(message);
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
        var savedThis = this;
        return new Promise(function (resolve, reject) {
            savedThis.resolve = resolve;
            savedThis.reject = reject;
            savedThis.execute();
        });
    };
    Tester.prototype.checkForTrailingDialogs = function (bool) {
        this.checkforExtraDialogs = bool;
        return this;
    };
    Tester.prototype.execute = function () {
        var _this = this;
        console.log('execute', this.script);
        var i = this.step;
        var _loop_1 = function () {
            var nextStep = this_1.script[i];
            console.log('step', nextStep);
            if (nextStep instanceof Responses.Response) {
                return { value: void 0 };
            }
            else {
                console.log('send next step');
                this_1.step = this_1.step + 1;
                console.log(this_1.script[this_1.step]);
                this_1.thePromise = this_1.thePromise.then(function () { return _this.testPlatfom.receive(_this.userId, nextStep); });
                return { value: void 0 };
            }
        };
        var this_1 = this;
        for (i; i < this.script.length; i++) {
            var state_1 = _loop_1();
            if (typeof state_1 === "object")
                return state_1.value;
        }
        if (this.step >= this.script.length) {
            var savedThis_1 = this;
            if (this.checkforExtraDialogs === false) {
                savedThis_1.resolve();
                return;
            }
            this.timer = setTimeout(function () {
                if (savedThis_1.state !== TestState.error) {
                    savedThis_1.resolve();
                }
            }, this.timeout);
        }
    };
    Tester.prototype.receive = function (message) {
        // console.log(`receive... ${this.step} of ${this.script.length}`, message);
        if (this.step >= this.script.length) {
            this.state = TestState.error;
            var err = new Error("received '" + util.inspect(message) + "' after script completed");
            if (this.reject) {
                this.reject(err);
                this.reject = null;
            }
            return;
        }
        var currentStep = this.script[this.step];
        if (currentStep instanceof Responses.Response) {
            // console.log('checking...');
            try {
                currentStep.check(message);
            }
            catch (err) {
                // console.log('check failed...');
                if (this.reject) {
                    this.reject(err);
                    this.reject = null;
                }
                return;
            }
            this.step = this.step + 1;
            this.execute();
            return;
        }
    };
    Tester.prototype.onError = function (err) {
        if (this.state === TestState.error) {
            return;
        }
        if (!this.reject) {
            console.error('no reject function yet');
            throw new Error('no reject function yet');
        }
        this.state = TestState.error;
        this.reject(err);
    };
    return Tester;
}());
exports.default = Tester;
//# sourceMappingURL=tester.1.js.map