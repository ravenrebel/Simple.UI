import {User} from '../../shared/models/user';
import {Message} from './message';

export class Chat {
  public id: string;
  public name: string;
  public pictureUrl: string;
  public members: User[];
  public lastMessage: Message;
  public isPrivate: boolean;
  public createdAt: Date;
  public unreadMessagesCount: number;
}
