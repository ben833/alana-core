"use strict";
var ButtonClass = (function () {
    function ButtonClass(outgoing) {
        this.message = {
            type: 'button',
            text: '',
            buttons: [],
        };
        this.outgoing = outgoing;
        return this;
    }
    Object.defineProperty(ButtonClass.prototype, "type", {
        get: function () {
            return this.message.type;
        },
        set: function (newType) {
            return;
        },
        enumerable: true,
        configurable: true
    });
    ButtonClass.prototype.text = function (newText) {
        if (typeof newText === 'undefined') {
            return this.message.text;
        }
        this.message.text = newText;
        return this;
    };
    Object.defineProperty(ButtonClass.prototype, "buttons", {
        get: function () {
            return this.message.buttons;
        },
        enumerable: true,
        configurable: true
    });
    ButtonClass.prototype.addButton = function () {
        switch (arguments.length) {
            case 1:
                this.message.buttons.push(arguments[0]);
                break;
            case 3:
                switch (arguments[0]) {
                    case 'postback': {
                        var button = {
                            type: 'postback',
                            text: arguments[1],
                            payload: arguments[2],
                        };
                        this.message.buttons.push(button);
                        break;
                    }
                    case 'url': {
                        var button = {
                            type: 'url',
                            text: arguments[1],
                            url: arguments[2],
                        };
                        this.message.buttons.push(button);
                        break;
                    }
                    default:
                        throw new Error('bad type of button');
                }
                break;
            default:
                throw new Error('bad number of arguments');
        }
        return this;
    };
    ButtonClass.prototype.send = function () {
        return this.outgoing.sendButtons(this.message);
    };
    return ButtonClass;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ButtonClass;
//# sourceMappingURL=button.js.map