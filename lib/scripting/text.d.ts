import { DialogAction, Incoming, DialogFunction } from '../types/script';
export default class Text extends DialogAction {
    dialog: DialogFunction;
    consumesMessage: boolean;
    constructor(dialog: DialogFunction);
    process(request: Incoming): DialogFunction;
}
