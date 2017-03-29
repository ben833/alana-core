import { DialogAction, Incoming, Outgoing, DialogFunction, StopFunction } from '../types/script';

export default class Intent extends DialogAction {
  public dialog: DialogFunction;
  private domain: string;
  private action: string;
  public consumesMessage: boolean = true;
  constructor(dialog: DialogFunction, domain: string, action: string = null) {
    super();
    this.dialog = dialog;
    this.domain = domain;
    this.action = action;
  }

  public process(request: Incoming) {
    if (this.action === null) {
      // only the domain matters
      if (request.intent.domain === this.domain) {
        return this.dialog;
      } else {
        return null;
      }
    } else {
       if (request.intent.domain === this.domain && request.intent.action === this.action) {
         return this.dialog;
       } else {
         return null;
       }
    }
  }
}
