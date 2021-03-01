import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HubConnection, HubConnectionBuilder} from '@microsoft/signalr';

import {Message} from '../../chats/models/message';
import {ChatService} from '../../chats/services/chat.service';
import {User} from '../../shared/models/user';
import {Chat} from '../../chats/models/chat';


@Injectable({
  providedIn: 'root'
})
export class ChatHubService {

  private hubConnection: HubConnection;

  constructor(private chatService: ChatService) { }

  public startConnection(token: string): void {
    this.stopConnection();
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.serverAppUrl + 'chats', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();
    this.hubConnection
      .start()
      .then(() => console.log('Connection started -- connected to chats --'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public stopConnection(): void {
    this.hubConnection?.stop()
      .then(() => console.log('Disconnected from chats'))
      .catch(err => console.log(err));
  }

  public getNotificationsAboutChatsUpdates(): void {
    this.hubConnection.on('NotifyAboutChatsUpdate', (chat: Chat) => {
      console.log(chat.lastMessage);
      this.chatService.chatsUpdatedSubject.next(chat);
    });
  }

  public notifyAboutChatsUpdate(chat: Chat): void {
    this.hubConnection.invoke('NotifyAboutChatsUpdate', chat).then(res => {
      console.log('sent to the group');
    });
  }

  public joinChat(chatId: string): void {
    this.hubConnection.invoke('JoinChat', chatId).then(res => {
      console.log('someone joined the group');
    });
  }

  public leaveChat(chatId: string): void {
    this.hubConnection.invoke('LeaveChat', chatId).then(res => {
      console.log('you left the group');
    });
  }

  public getNotificationsAboutLeaving(): void {
    this.hubConnection.on('NotifyMembersAboutLeaving', (user: User, chat: Chat) => {
      this.chatService.leftChatSubject.next({chat, user});
      console.log('notification: ' + user.userName + ' left the group');
    });
  }

  public notifyAboutLeaving(chat: Chat, user: User): void {
    this.hubConnection.invoke('NotifyMembersAboutLeaving', user, chat).then(res => {
      console.log('you notified the group about leaving');
    });
  }

  public getNotificationsAboutJoining(): void {
    this.hubConnection.on('NotifyMembersAboutJoining', (user: User, chat: Chat) => {
      this.chatService.joinChatSubject.next({chat, user});
      console.log('notification: ' + user.userName + ' joined the group');
    });
  }

  public notifyGroupAboutJoining(chat: Chat, user: User): void {
    this.hubConnection.invoke('NotifyMembersAboutJoining', user, chat).then(res => {
      console.log('you notified the group about joining');
    });
  }

  public getNotificationsAboutBeingJoined(): void {
    this.hubConnection.on('NotifyNonMemberAboutJoining', (user: User, chat: Chat) => {
      this.chatService.joinChatSubject.next({chat, user});
      this.joinChat(chat.id);
      console.log('notification: you joined the group by someone');
    });
  }

  public notifyUserAboutJoining(chat: Chat, user: User): void {
    this.hubConnection.invoke('NotifyNonMemberAboutJoining', user, chat).then(res => {
      console.log('you notified ' + user.userName + ' about his/her joining');
    });
  }

  public notifyAboutChatEditing(chat: Chat): void {
    this.hubConnection.invoke('NotifyMembersAboutChatEditing', chat).then(res => {
      console.log('you notified group about chat editing');
    });
  }

  public getNotificationsAboutChatEditing(): void {
    this.hubConnection.on('NotifyMembersAboutChatEditing', (chat: Chat) => {
      this.chatService.editedChatSubject.next(chat);
      console.log('notification: chat was updated');
    });
  }
}
