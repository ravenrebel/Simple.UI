import {User} from './user';
import {Attachment} from './attachment';

export class Post {
  public id: string;
  public header: string;
  public text: string;
  public creator: User;
  public createdAt: Date;
  public attachments: Attachment[];
}
