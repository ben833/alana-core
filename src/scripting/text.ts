import { DialogAction, Incoming, Outgoing, DialogFunction, StopFunction } from '../types/script';

export default class Text extends DialogAction {
  public dialog: DialogFunction;
  public consumesMessage: boolean = true;
  constructor(dialog: DialogFunction) {
    super();
    this.dialog = dialog;
  }

  public process(request: Incoming) {
    if (request.message.type === 'text') {
      return this.dialog;
    }
    return null;
  }
}
