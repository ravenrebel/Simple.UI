import {Chat} from './chat';

export class MessageSearchOptions {
  constructor(public text: string, public userId: string, public chat?: Chat) {
    this.text = text;
    this.userId = userId;
    this.chat = chat;
  }
}
