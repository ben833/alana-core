"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var outgoing_1 = require("../outgoing");
exports.Outgoing = outgoing_1.default;
;
var DialogAction = (function () {
    function DialogAction() {
        this.always = false;
        this.blocking = false;
        this.consumesMessage = false;
    }
    return DialogAction;
}());
exports.DialogAction = DialogAction;
//# sourceMappingURL=script.js.map