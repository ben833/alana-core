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
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(dialog, payload) {
        if (payload === void 0) { payload = null; }
        var _this = _super.call(this) || this;
        _this.consumesMessage = true;
        _this.dialog = dialog;
        _this.payload = payload;
        return _this;
    }
    Button.prototype.process = function (request) {
        if (request.message.type !== 'postback') {
            return null;
        }
        if (this.payload === null) {
            return this.dialog;
        }
        else {
            if (request.message.payload === this.payload) {
                return this.dialog;
            }
            else {
                return null;
            }
        }
    };
    return Button;
}(script_1.DialogAction));
exports.default = Button;
//# sourceMappingURL=button.js.map