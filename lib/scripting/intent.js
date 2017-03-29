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
var Intent = (function (_super) {
    __extends(Intent, _super);
    function Intent(dialog, domain, action) {
        if (action === void 0) { action = null; }
        var _this = _super.call(this) || this;
        _this.consumesMessage = true;
        _this.dialog = dialog;
        _this.domain = domain;
        _this.action = action;
        return _this;
    }
    Intent.prototype.process = function (request) {
        if (this.action === null) {
            // only the domain matters
            if (request.intent.domain === this.domain) {
                return this.dialog;
            }
            else {
                return null;
            }
        }
        else {
            if (request.intent.domain === this.domain && request.intent.action === this.action) {
                return this.dialog;
            }
            else {
                return null;
            }
        }
    };
    return Intent;
}(script_1.DialogAction));
exports.default = Intent;
//# sourceMappingURL=intent.js.map