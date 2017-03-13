import { DialogAction, Incoming, DialogFunction } from '../types/script';
export default class Match extends DialogAction {
    dialog: DialogFunction;
    private pattern;
    consumesMessage: boolean;
    constructor(dialog: DialogFunction, pattern: string | RegExp);
    process(request: Incoming): DialogFunction;
}
