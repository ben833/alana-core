"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var _ = require("lodash");
var Memory = (function () {
    function Memory(bot) {
        this.users = {};
        return this;
    }
    Memory.prototype.getUser = function (user) {
        var normalizedUserId = normalized(user);
        if (!_.has(this.users, [user.platform, normalizedUserId])) {
            return Promise.reject(new Error('User does not exist'));
        }
        return Promise.resolve(this.users[user.platform][normalizedUserId]);
    };
    Memory.prototype.saveUser = function (user) {
        _.set(this.users, [user.platform, normalized(user)], user);
        return Promise.resolve(user);
    };
    return Memory;
}());
exports.default = Memory;
function normalized(user) {
    return "" + user.platform + user.id.toString();
}
//# sourceMappingURL=memory.js.map