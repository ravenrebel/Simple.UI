import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

import {HubConnection, HubConnectionBuilder} from '@microsoft/signalr';
import {NewsService} from '../../news-board/services/news.service';
import {Post} from '../../shared/models/post';
import {User} from '../../shared/models/user';
import {UserFolloweesService} from '../../user-profiles/services/user-followees.service';


@Injectable({
  providedIn: 'root'
})
export class NotificationHubService {

  private hubConnection: HubConnection;

  constructor(private newsService: NewsService,
              private followeesService: UserFolloweesService) {
  }

  public startConnection(token: string): void {
    this.stopConnection();
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.serverAppUrl + 'notifications', {accessTokenFactory: () => token})
      .withAutomaticReconnect()
      .build();
    this.hubConnection
      .start()
      .then(() => console.log('Connection started -- connected to notifications --'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public stopConnection(): void {
    this.hubConnection?.stop()
      .then(() => console.log('Disconnected from notifications'))
      .catch(err => console.log(err));
  }

  public getNotificationsAboutPostCreation(): void {
    this.hubConnection.on('NotifyAboutPostCreation', (post: Post) => {
      console.log(post);
      this.newsService.createdPostSubject.next(post);
      console.log('hub -- post received');
    });
  }

  public NotifyAboutPostCreation(post: Post): void {
    this.hubConnection.invoke('NotifyAboutPostCreation', post).then(res => {
      console.log('posted to the group');
    });
  }

  public getNotificationsAboutPostRemoval(): void {
    this.hubConnection.on('NotifyAboutPostRemoval', (post: Post) => {
      console.log(post);
      this.newsService.removedPostSubject.next(post);
      console.log('hub -- post was deleted');
    });
  }

  public NotifyAboutPostRemoval(post: Post): void {
    this.hubConnection.invoke('NotifyAboutPostRemoval', post).then(res => {
      console.log('post was deleted');
    });
  }

  public getNotificationsAboutPostEditing(): void {
    this.hubConnection.on('NotifyAboutPostEditing', (post: Post) => {
      console.log(post);
      this.newsService.editedPostSubject.next(post);
      console.log('hub -- post was updated');
    });
  }

  public NotifyAboutPostEditing(post: Post): void {
    this.hubConnection.invoke('NotifyAboutPostEditing', post).then(res => {
      console.log('post was updated');
    });
  }

  public subscribeNews(followeeId: string): void {
    this.hubConnection.invoke('Subscribe', followeeId).then(res => {
      console.log('you subscribed to group news');
    });
  }

  public unsubscribeNews(followeeId: string): void {
    this.hubConnection.invoke('Unsubscribe', followeeId).then(res => {
      console.log('you unsubscribe the group news');
    });
  }

  public getNotificationsAboutNewFollower(): void {
    this.hubConnection.on('NotifyAboutSubscription', (follower: User) => {
      this.followeesService.newFollowerSubject.next(follower);
      console.log('notification: ' + follower.userName + ' subscribed you');
    });
  }

  public notifyAboutBeingSubscribed(followeeId: string, user: User): void {
    this.hubConnection.invoke('NotifyAboutSubscription', followeeId, user).then(res => {
      console.log('you notified user about subscribing');
    });
  }

  public getNotificationsAboutUnsubscribedFollower(): void {
    this.hubConnection.on('NotifyAboutUnsubscription', (follower: User) => {
      this.followeesService.unsubscribedFollowerSubject.next(follower);
      console.log('notification: ' + follower.userName + ' unsubscribed you');
    });
  }

  public notifyAboutBeingUnsubscribed(followeeId: string, user: User): void {
    this.hubConnection.invoke('NotifyAboutUnsubscription', followeeId, user).then(res => {
      console.log('you notified user about being unsubscribed');
    });
  }
}
