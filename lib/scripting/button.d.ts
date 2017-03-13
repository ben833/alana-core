import { DialogAction, Incoming, DialogFunction } from '../types/script';
export default class Button extends DialogAction {
    dialog: DialogFunction;
    private payload;
    consumesMessage: boolean;
    constructor(dialog: DialogFunction, payload?: string);
    process(request: Incoming): DialogFunction;
}
