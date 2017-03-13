"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var button_1 = require("./outgoing/button");
var Promise = require("bluebird");
var _ = require("lodash");
var script_1 = require("./scripting/script");
var errors_1 = require("./errors");
var Outgoing = (function () {
    function Outgoing(bot, user) {
        this.promise = Promise.resolve(null);
        this.bot = bot;
        this.user = user;
        return this;
    }
    Outgoing.prototype.startScript = function (name, scriptArguments) {
        if (name === void 0) { name = ''; }
        if (scriptArguments === void 0) { scriptArguments = {}; }
        this.user.script = name;
        this.user.scriptStage = -1;
        this.user.scriptArguments = scriptArguments;
        script_1.stopFunction(script_1.StopScriptReasons.NewScript);
    };
    Outgoing.prototype.endScript = function () {
        throw new script_1.EndScriptException(script_1.EndScriptReasons.Called);
    };
    Outgoing.prototype.goto = function (dialogName) {
        throw new script_1.GotoDialogException(dialogName);
    };
    Outgoing.prototype.startTyping = function () {
        throw new Error('not implemented');
    };
    Outgoing.prototype.endTyping = function () {
        throw new Error('not implemented');
    };
    Outgoing.prototype.send = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (arguments.length === 0) {
            throw new errors_1.MissingArguments();
        }
        if (arguments.length === 1) {
            var arg = arguments[0];
            if (_.isString(arg)) {
                return this.sendText(arg);
            }
        }
        throw new errors_1.BadArguments();
    };
    Outgoing.prototype.sendText = function (text) {
        if (typeof text === 'undefined') {
            throw new errors_1.BadArguments('Got undefined');
        }
        var textMessage = {
            type: 'text',
            text: text,
        };
        return this._send(textMessage);
    };
    Outgoing.prototype.sendImage = function (url) {
        var message = {
            type: 'image',
            url: url,
        };
        return this._send(message);
    };
    Outgoing.prototype.sendButtons = function () {
        if (arguments.length === 0) {
            return new button_1.default(this);
        }
        else {
            return this._send(arguments[0]);
        }
    };
    Outgoing.prototype.sendAudio = function (url) {
        var message = {
            type: 'audio',
            url: url,
        };
        return this._send(message);
    };
    Outgoing.prototype._send = function (message) {
        var _this = this;
        this.promise = this.promise
            .then(function () { return _this.user._platform.send(_this.user, message); })
            .catch(function (err) {
            _this.bot.logger.error('Error sending message to user', err);
        });
        return this;
    };
    return Outgoing;
}());
exports.default = Outgoing;
//# sourceMappingURL=outgoing.js.map