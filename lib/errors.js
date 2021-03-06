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
var MissingArguments = (function (_super) {
    __extends(MissingArguments, _super);
    function MissingArguments(reason) {
        if (reason === void 0) { reason = 'Missing arguments'; }
        var _this = _super.call(this, reason) || this;
        // Set the prototype explicitly.
        Object.setPrototypeOf(_this, MissingArguments.prototype);
        return _this;
    }
    return MissingArguments;
}(Error));
exports.MissingArguments = MissingArguments;
var BadArguments = (function (_super) {
    __extends(BadArguments, _super);
    function BadArguments(reason) {
        if (reason === void 0) { reason = 'Bad arguments'; }
        var _this = _super.call(this, reason) || this;
        // Set the prototype explicitly.
        Object.setPrototypeOf(_this, BadArguments.prototype);
        return _this;
    }
    return BadArguments;
}(Error));
exports.BadArguments = BadArguments;
//# sourceMappingURL=errors.js.map