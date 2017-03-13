import { DialogAction, Incoming, Outgoing, DialogFunction, StopFunction } from '../types/script';

export default class Button extends DialogAction {
  public dialog: DialogFunction;
  private payload: string;
  public consumesMessage: boolean = true;
  constructor(dialog: DialogFunction, payload: string = null) {
    super();
    this.dialog = dialog;
    this.payload = payload;
  }

  public process(request: Incoming) {
    if (request.message.type !== 'postback') {
      return null;
    }

    if (this.payload === null) {
      return this.dialog;
    } else {
       if (request.message.payload === this.payload) {
         return this.dialog;
       } else {
         return null;
       }
    }
  }
}
