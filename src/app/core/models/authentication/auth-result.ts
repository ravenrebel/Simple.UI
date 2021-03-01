import {User} from '../../../shared/models/user';

export class AuthResult {
  public user: User;
  public accessToken: string;
  public refreshToken: string;
  public accessTokenExpirationTime: number;
}
