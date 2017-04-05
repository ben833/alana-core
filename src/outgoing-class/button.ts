import Outgoing from '../outgoing';
import { Message, MessageType, MessageTypes } from '../types/message';
import { ButtonMessage, Button, PostbackType, LinkType, PostbackButton, LinkButton } from '../types/messages/button';
import * as uuid from 'uuid';

export default class ButtonClass {
  private message: ButtonMessage = {
    type: 'button',
    text: '',
    buttons: [],
    id: uuid.v4(),
    conversation_id: null,
  };
  private outgoing: Outgoing;

  constructor(outgoing: Outgoing) {
    this.outgoing = outgoing;
    this.message.conversation_id = outgoing.conversation;
    return this;
  }

  set type(newType: MessageType) {
    return;
  }

  get type(): MessageType {
    return this.message.type;
  }

  public text(): string;
  public text(newText: string): this;
  public text(newText?: string): this | string {
    if (typeof newText === 'undefined') {
      return this.message.text;
    }
    this.message.text = newText;
    return this;
  }

  get buttons(): Array<Button> {
    return this.message.buttons;
  }

  public addButton(newButton: Button): this;
  public addButton(type: PostbackType, text: string, payload: string): this;
  public addButton(type: LinkType, text: string, url: string): this;
  public addButton(): this {
    switch (arguments.length) {
      case 1:
        this.message.buttons.push(arguments[0]);
        break;
      case 3:
        switch (arguments[0]) {
          case'postback': {
            const button: PostbackButton = {
              type: 'postback',
              text: arguments[1],
              payload: arguments[2],
            };
            this.message.buttons.push(button);
            break;
          }

          case 'url': {
            const button: LinkButton = {
              type: 'url',
              text: arguments[1],
              url: arguments[2],
            };
            this.message.buttons.push(button);
            break;
          }

          default:
            throw new Error('bad type of button');
        }
        break;

      default:
        throw new Error('bad number of arguments');
    }
    return this;
  }

  public send(): Outgoing {
    return this.outgoing.sendButtons(this.message);
  }
}
