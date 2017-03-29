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
var _ = require("lodash");
var Promise = require("bluebird");
var expect_1 = require("./expect");
var button_1 = require("./button");
var intent_1 = require("./intent");
var dialog_1 = require("./dialog");
var StopScriptReasons;
(function (StopScriptReasons) {
    StopScriptReasons[StopScriptReasons["Called"] = 0] = "Called";
    StopScriptReasons[StopScriptReasons["NewScript"] = 1] = "NewScript";
    StopScriptReasons[StopScriptReasons["ExpectCaught"] = 2] = "ExpectCaught";
})(StopScriptReasons = exports.StopScriptReasons || (exports.StopScriptReasons = {}));
var StopException = (function (_super) {
    __extends(StopException, _super);
    function StopException(reason) {
        var _this = _super.call(this, "Script stopped due to " + StopScriptReasons[reason]) || this;
        // Set the prototype explicitly.
        Object.setPrototypeOf(_this, StopException.prototype);
        _this.reason = reason;
        return _this;
    }
    return StopException;
}(Error));
exports.StopException = StopException;
var EndScriptReasons;
(function (EndScriptReasons) {
    EndScriptReasons[EndScriptReasons["Called"] = 0] = "Called";
    EndScriptReasons[EndScriptReasons["Reached"] = 1] = "Reached";
})(EndScriptReasons = exports.EndScriptReasons || (exports.EndScriptReasons = {}));
var EndScriptException = (function (_super) {
    __extends(EndScriptException, _super);
    function EndScriptException(reason) {
        var _this = _super.call(this, "End of script due to " + EndScriptReasons[reason]) || this;
        // Set the prototype explicitly.
        Object.setPrototypeOf(_this, EndScriptException.prototype);
        _this.reason = reason;
        return _this;
    }
    return EndScriptException;
}(Error));
exports.EndScriptException = EndScriptException;
var GotoDialogException = (function (_super) {
    __extends(GotoDialogException, _super);
    function GotoDialogException(dialogName) {
        var _this = _super.call(this, "Go to script named " + dialogName) || this;
        // Set the prototype explicitly.
        Object.setPrototypeOf(_this, GotoDialogException.prototype);
        _this.dialogName = dialogName;
        return _this;
    }
    return GotoDialogException;
}(Error));
exports.GotoDialogException = GotoDialogException;
var Script = (function () {
    function Script(bot, scriptName) {
        this.dialogs = [];
        // tslint:disable-next-line:variable-name
        this._begin = null;
        this.bot = bot;
        this.name = scriptName;
        this.intent = this._intent.bind(this);
        this.intent.always = this._intentAlways.bind(this);
        this.dialog = this._dialog.bind(this);
        this.dialog.always = this._dialogAlways.bind(this);
        this.expect = this.completedExpect.bind(this);
        this.expect.text = this.expectText.bind(this);
        this.expect.button = this.expectButton.bind(this);
        this.expect.intent = this.expectIntent.bind(this);
        this.expect.match = this.expectMatch.bind(this);
        this.expect.catch = this.expectCatch.bind(this);
        this.button = this._button.bind(this);
        this.button.always = this._buttonAlways.bind(this);
        return this;
    }
    Script.prototype.expectText = function () {
        var e = new expect_1.default(this);
        this.dialogs.push(e);
        e.text.apply(e, arguments);
        return e;
    };
    Script.prototype.expectButton = function () {
        var e = new expect_1.default(this);
        this.dialogs.push(e);
        e.button.apply(e, arguments);
        return e;
    };
    Script.prototype.expectIntent = function () {
        var e = new expect_1.default(this);
        this.dialogs.push(e);
        e.intent.apply(e, arguments);
        return e;
    };
    Script.prototype.expectMatch = function () {
        var e = new expect_1.default(this);
        this.dialogs.push(e);
        e.match.apply(e, arguments);
        return e;
    };
    Script.prototype.expectCatch = function () {
        var e = new expect_1.default(this);
        this.dialogs.push(e);
        e.catch.apply(e, arguments);
        return e;
    };
    Script.prototype.completedExpect = function (fn) {
        var e = new expect_1.default(this);
        this.dialogs.push(e);
        e.catch(fn);
        return this;
    };
    Object.defineProperty(Script.prototype, "length", {
        get: function () {
            return this.dialogs.length;
        },
        enumerable: true,
        configurable: true
    });
    Script.prototype.run = function (incoming, outgoing, nextScript, step) {
        var _this = this;
        if (step === void 0) { step = incoming.user.scriptStage; }
        var topic = incoming.intent.domain;
        var action = incoming.intent.action;
        var top = _.slice(this.dialogs, 0, Math.max(0, step));
        var bottom = _.slice(this.dialogs, Math.max(0, step));
        var validDialogs = bottom;
        var forcedDialogs = top.filter(function (shell) { return shell.always; });
        var runUnforced = function () {
            return Promise.resolve()
                .then(function () {
                return _this.callScript(incoming, outgoing, validDialogs, nextScript, Math.max(step, 0));
            });
        };
        return Promise.resolve()
            .then(function () {
            if (step === -1) {
                incoming.user.scriptStage = 0;
                if (_this._begin !== null) {
                    return _this._begin(incoming, outgoing, stopFunction);
                }
            }
        })
            .then(function () {
            return _this.callScript(incoming, outgoing, forcedDialogs, runUnforced, 0);
        });
    };
    Script.prototype.begin = function (dialogFunction) {
        this._begin = dialogFunction;
        return this;
    };
    Script.prototype._dialog = function () {
        var dialog;
        switch (arguments.length) {
            case 1:
                dialog = new dialog_1.default(arguments[0]);
                break;
            case 2:
                dialog = new dialog_1.default(arguments[1], arguments[0]);
                break;
            default:
                throw new Error('dialog called incorrectly');
        }
        this.dialogs.push(dialog);
        return this;
    };
    Script.prototype._dialogAlways = function () {
        this._dialog.apply(this, arguments);
        _.last(this.dialogs).always = true;
        return this;
    };
    Script.prototype._intent = function () {
        var intent;
        switch (arguments.length) {
            case 2:
                intent = new intent_1.default(arguments[1], arguments[0]);
                break;
            case 3:
                intent = new intent_1.default(arguments[2], arguments[0], arguments[1]);
                break;
            default:
                throw new Error('Incorect argument count');
        }
        this.dialogs.push(intent);
        return this;
    };
    Script.prototype._intentAlways = function () {
        this._intent.apply(this, arguments);
        _.last(this.dialogs).always = true;
        return this;
    };
    Script.prototype._button = function () {
        var button;
        switch (arguments.length) {
            case 1:
                button = new button_1.default(arguments[0]);
                break;
            case 2:
                button = new button_1.default(arguments[1], arguments[0]);
                break;
            default:
                throw new Error('bad arguments');
        }
        this.dialogs.push(button);
        return this;
    };
    Script.prototype._buttonAlways = function () {
        this._button.apply(this, arguments);
        _.last(this.dialogs).always = true;
        return this;
    };
    Script.prototype.callScript = function (request, response, dialogs, nextScript, thisStep) {
        var _this = this;
        if (dialogs.length === 0) {
            return nextScript();
        }
        var currentDialog = _.head(dialogs);
        var nextDialogs = _.tail(dialogs);
        // tslint:disable-next-line:variable-name
        var __this = this;
        return Promise.resolve()
            .then(function () {
            // Should the bot process the message, is there a match with current message?
            if (currentDialog.consumesMessage && request.message._eaten) {
                return null;
            }
            var fn = currentDialog.process(request);
            return fn;
        })
            .then(function (dialog) {
            if (dialog === null) {
                return;
            }
            if (currentDialog.consumesMessage) {
                request.message._eaten = true;
            }
            return dialog(request, response, stopFunction);
        })
            .then(function () {
            request.user.scriptStage = Math.max(request.user.scriptStage, thisStep + 1);
            if (nextDialogs.length === 0) {
                // throw new EndScriptException(EndScriptReasons.Reached);
                return nextScript();
            }
            var dialog = _.head(nextDialogs);
            if (dialog.blocking === false) {
                return __this.callScript(request, response, nextDialogs, nextScript, thisStep + 1);
            }
        })
            .catch(function (err) {
            if (err instanceof GotoDialogException) {
                for (var i = 0; i < _this.dialogs.length; i++) {
                    var dialog = _this.dialogs[i];
                    if (dialog instanceof dialog_1.default && dialog.name === err.dialogName) {
                        request.user.scriptStage = i;
                        return _this.run(request, response, nextScript, i);
                    }
                }
            }
            // pass it up the chain
            throw err;
        });
    };
    return Script;
}());
exports.default = Script;
function stopFunction(reason) {
    if (reason === void 0) { reason = StopScriptReasons.Called; }
    throw new StopException(reason);
}
exports.stopFunction = stopFunction;
//# sourceMappingURL=script.js.map