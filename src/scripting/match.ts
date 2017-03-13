import { DialogAction, Incoming, Outgoing, DialogFunction, StopFunction } from '../types/script';

export default class Match extends DialogAction {
  public dialog: DialogFunction;
  private pattern: RegExp;
  public consumesMessage: boolean = true;
  constructor(dialog: DialogFunction, pattern: string | RegExp) {
    super();
    this.dialog = dialog;
    if (typeof pattern === 'string') {
      this.pattern = new RegExp(pattern);
    } else {
      this.pattern = pattern;
    }
  }

  public process(request: Incoming) {
    if (request.message.type !== 'text') {
      return null;
    }
    const match = request.message.text.match(this.pattern);
    if (match === null) {
      return null;
    }
    return this.dialog;
  }
}
