import Outgoing from '../outgoing';
import { Message, MessageType } from '../types/message';
import { Button, PostbackType, LinkType } from '../types/messages/button';
export default class ButtonClass implements Message {
    private message;
    private outgoing;
    constructor(outgoing: Outgoing);
    type: MessageType;
    text(): string;
    text(newText: string): this;
    readonly buttons: Array<Button>;
    addButton(newButton: Button): this;
    addButton(type: PostbackType, text: string, payload: string): this;
    addButton(type: LinkType, text: string, url: string): this;
    send(): Outgoing;
}
