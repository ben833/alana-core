import { DialogAction, Incoming, Outgoing, DialogFunction, StopFunction } from '../types/script';

export default class Dialog extends DialogAction {
  public dialog: DialogFunction;
  public name: string;
  constructor(dialog: DialogFunction, name: string = null) {
    super();
    this.dialog = dialog;
    this.name = name;
  }

  public process(request: Incoming) {
    return this.dialog;
  }
}
