import {User} from '../../shared/models/user';

export class Message {
  public id: string;
  public text: string;
  public sender: User;
  public sentAt: Date;
  public attachmentUrl: string;
  public chatId: string;
}
