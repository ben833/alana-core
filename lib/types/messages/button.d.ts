import { Message, MessageTypes } from '../message';
export { MessageTypes };
export declare type Button = PostbackButton | LinkButton;
export declare type PostbackType = 'postback';
export declare type LinkType = 'url';
export declare type ButtonType = PostbackType | LinkType;
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
