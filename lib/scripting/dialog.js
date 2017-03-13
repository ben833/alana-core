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
var Dialog = (function (_super) {
    __extends(Dialog, _super);
    function Dialog(dialog, name) {
        if (name === void 0) { name = null; }
        var _this = _super.call(this) || this;
        _this.dialog = dialog;
        _this.name = name;
        return _this;
    }
    Dialog.prototype.process = function (request) {
        return this.dialog;
    };
    return Dialog;
}(script_1.DialogAction));
exports.default = Dialog;
//# sourceMappingURL=dialog.js.map