import Outgoing from '../../outgoing';
import { Message, MessageType, MessageTypes } from '../message';
export { MessageTypes };
  // tslint:disable:variable-name

export type Button = PostbackButton | LinkButton;

export type PostbackType = 'postback';
export type LinkType = 'url';
export type ButtonType = PostbackType | LinkType;

export interface PostbackButton {
  type: PostbackType;
  text: string;
  payload: string;
}

export interface LinkButton {
  type: LinkType;
  text: string;
  url: string;
}

export interface ButtonMessage extends Message {
  type: 'button';
  text: string;
  buttons: Array<Button>;
}
