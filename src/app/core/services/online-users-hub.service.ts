import {Injectable} from '@angular/core';
import {HubConnection, HubConnectionBuilder} from '@microsoft/signalr';
import {environment} from '../../../environments/environment';

import {UserService} from '../../user-profiles/services/user.service';
import {User} from '../../shared/models/user';

@Injectable({
  providedIn: 'root'
})// @ts-ignore
export class OnlineUsersHubService {

  private hubConnection: HubConnection;

  constructor(private userService: UserService) {
  }

  public startConnection(token: string): void {
    this.stopConnection();
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.serverAppUrl + 'online-users', {accessTokenFactory: () => token})
      .withAutomaticReconnect()
      .build();
    this.hubConnection
      .start()
      .then(() => console.log('Connection started -- online --'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public stopConnection(): void {
    this.hubConnection?.stop()
      .then(() => console.log('-- offline --'))
      .catch(err => {
        console.log(err);
      });
  }

  public getRefreshedStatus(user: User): void {
    this.hubConnection.on('RefreshStatus', (isOnline: boolean, userId: string) => {
      this.userService.activityStatusSubject.next({isOnline, userId});

      if (user.id === userId) {
        user.isOnline = isOnline;
      }

      const status = isOnline ? 'online' : 'offline';
      console.log(userId + ' is ' + status);
    });
  }
}
