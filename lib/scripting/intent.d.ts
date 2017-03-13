import { DialogAction, Incoming, DialogFunction } from '../types/script';
export default class Intent extends DialogAction {
    dialog: DialogFunction;
    private domain;
    private action;
    consumesMessage: boolean;
    constructor(dialog: DialogFunction, domain: string, action?: string);
    process(request: Incoming): DialogFunction;
}
