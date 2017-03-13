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
var Match = (function (_super) {
    __extends(Match, _super);
    function Match(dialog, pattern) {
        var _this = _super.call(this) || this;
        _this.consumesMessage = true;
        _this.dialog = dialog;
        if (typeof pattern === 'string') {
            _this.pattern = new RegExp(pattern);
        }
        else {
            _this.pattern = pattern;
        }
        return _this;
    }
    Match.prototype.process = function (request) {
        if (request.message.type !== 'text') {
            return null;
        }
        var match = request.message.text.match(this.pattern);
        if (match === null) {
            return null;
        }
        return this.dialog;
    };
    return Match;
}(script_1.DialogAction));
exports.default = Match;
//# sourceMappingURL=match.js.map