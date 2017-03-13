import { DialogAction, Incoming, DialogFunction } from '../types/script';
export default class Dialog extends DialogAction {
    dialog: DialogFunction;
    name: string;
    constructor(dialog: DialogFunction, name?: string);
    process(request: Incoming): DialogFunction;
}
