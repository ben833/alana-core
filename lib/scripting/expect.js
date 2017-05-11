"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var script_1 = require("../types/script");
var text_1 = require("./text");
var button_1 = require("./button");
var intent_1 = require("./intent");
var match_1 = require("./match");
var Promise = require("bluebird");
var Expect = (function (_super) {
    __extends(Expect, _super);
    function Expect(script) {
        var _this = _super.call(this) || this;
        _this.guid = Math.random();
        _this.expects = [];
        _this.catchFn = null;
        _this.blocking = true;
        _this.consumesMessage = true;
        _this.myScript = script;
        _this.dialog = _this.myScript.dialog.bind(_this.myScript);
        _this.dialog.always = _this.myScript.dialog.always.bind(_this.myScript);
        _this.expect = _this.myScript.expect;
        _this.catch(function (s, r) {
            return Promise.resolve();
        });
        return _this;
    }
    Expect.prototype.text = function (dialogFunction) {
        var text = new text_1.default(dialogFunction);
        this.expects.push(text);
        return this;
    };
    Expect.prototype.button = function () {
        var button;
        switch (arguments.length) {
            case 1:
                button = new button_1.default(arguments[0]);
                break;
            case 2:
                button = new button_1.default(arguments[1], arguments[0]);
                break;
            default:
                throw new Error('Exepct.button called incorrectly');
        }
        this.expects.push(button);
        return this;
    };
    Expect.prototype.intent = function () {
        var intent;
        switch (arguments.length) {
            case 2:
                intent = new intent_1.default(arguments[1], arguments[0]);
                break;
            case 3:
                intent = new intent_1.default(arguments[2], arguments[0], arguments[1]);
                break;
            default:
                throw new Error('Expect.intent called incorrectly');
        }
        this.expects.push(intent);
        return this;
    };
    Expect.prototype.match = function (pattern, dialogFunction) {
        var match = new match_1.default(dialogFunction, pattern);
        this.expects.push(match);
        return this;
    };
    Expect.prototype.catch = function (dialogFunction) {
        this.catchFn = dialogFunction;
        return this.myScript;
    };
    Expect.prototype.process = function (request) {
        for (var i = 0; i < this.expects.length; i++) {
            var current = this.expects[i];
            var fn = current.process(request);
            if (fn !== null) {
                return fn;
            }
        }
        // nothing matched
        if (this.catchFn) {
            return this.catchFn;
        }
        return null;
    };
    return Expect;
}(script_1.DialogAction));
exports.default = Expect;
//# sourceMappingURL=expect.js.map