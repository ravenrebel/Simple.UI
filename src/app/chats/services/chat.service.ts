import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

import {Chat} from '../models/chat';
import {User} from '../../shared/models/user';
import {Message} from '../models/message';
import {map} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})// @ts-ignore
export class ChatService {

  constructor(private http: HttpClient) { }

  baseUrl = environment.apiUrl + 'chats/';
  readMessagesSubject = new Subject<string>();
  leftChatSubject = new Subject<{chat: Chat, user: User}>();
  joinChatSubject = new Subject<{chat: Chat, user: User}>();
  chatsUpdatedSubject = new Subject<Chat>();
  deletedChatSubject = new Subject<Chat>();
  editedChatSubject = new Subject<Chat>();
  searchedMessageSubject = new BehaviorSubject<Message>(null);

  public getChatInterlocutor(chat: Chat, currentUser: User): User {
    if (chat.members.length === 2) {
      if (chat.members[0].userName === currentUser.userName) {
        return chat.members[1];
      } else {
        return chat.members[0];
      }
    }
  }

  public createChat(chat: Chat): Observable<Chat> {
    return this.http.post<Chat>(this.baseUrl, chat);
  }

  public getChatById(id: string): Observable<Chat> {
    return this.http.get<Chat>(this.baseUrl + id);
  }

  public editChat(id: string, chat: Chat): Observable<Chat> {
    return this.http.put<Chat>(this.baseUrl + id, chat);
  }

  public deleteChat(id: string): Observable<string> {
    return this.http.delete<string>(this.baseUrl + id);
  }

  public addChatMember(chatId: string, user: User): Observable<User> {
    return this.http.post<User>(this.baseUrl + chatId + '/members', user);
  }

  public removeChatMember(chatId: string, userId: string): Observable<string> {
    return this.http.delete<string>(this.baseUrl + chatId + '/members/' + userId);
  }

  public createMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(environment.apiUrl + 'messages', message);
  }

  public getUnreadMessagesCount(chatId: string, userId: string): Observable<number> {
    return this.http.get<number>(this.baseUrl + chatId + '/members/' + userId + '/messages/unread-count');
  }

  public getMessages(chatId: string, userId: string, offset: number, limit: number, isRead?: boolean): Observable<Message[]> {
    let getParams = new HttpParams();
    if (isRead != null) {
      getParams = getParams.append('isRead', String(isRead));
    }
    return this.http.get<Message[]>(this.baseUrl + chatId + '/members/' + userId + '/messages/' + offset + '/' + limit,
      {
        params: getParams
      });
  }

  public getMessagesByText(chat: Chat, offset: number, limit: number, text?: string): Observable<Message[]> {
    let searchParams = new HttpParams();
    if (text) {
      searchParams = searchParams.append('text', text);
    }
    return this.http.get<Message[]>(this.baseUrl + chat.id + '/messages/text-search/' + offset + '/' + limit,
      {
        params: searchParams
      }).pipe(map((messages) => {
        return this._setActivityStatus(messages, chat);
    }));
  }

  public getMessagesBySender(chatId: string,
                             offset: number,
                             limit: number,
                             senderName?: string)
    : Observable<Message[]> {
    let searchParams = new HttpParams();
    if (senderName) {
      searchParams = searchParams.append('senderName', senderName);
    }
    return this.http.get<Message[]>(this.baseUrl + chatId + '/messages/sender-search/' + offset + '/' + limit,
      {
        params: searchParams
      });
  }

  public readMessage(messageId: string, userId: string): Observable<void> {
    return this.http.get<void>( environment.apiUrl + 'messages/' + messageId + '/read/' + userId);
  }

  public getMessagesByTextGlobal(userId: string, offset: number, limit: number, text?: string): Observable<Message[]> {
    let searchParams = new HttpParams();
    if (text) {
      searchParams = searchParams.append('text', text);
    }
    return this.http.get<Message[]>( environment.apiUrl + 'messages/search/' + userId + '/' + offset + '/' + limit,
      {
        params: searchParams
      });
  }

  public readMessages(chatId: string, userId: string): Observable<void> {
    return this.http.get<void>(this.baseUrl + chatId + '/members/' + userId + '/messages/read');
  }

  public getMessagesInScope(messageId: string, chat: Chat, offset: number, limit: number): Observable<Message[]> {
    return this.http.get<Message[]>(this.baseUrl + chat.id + '/messages/' + messageId + '/scope/' + offset + '/' + limit)
      .pipe(map((messages) => {
        return this._setActivityStatus(messages, chat);
      }));
  }

  private _setActivityStatus(messages: Message[], chat: Chat): Message[] {
    messages.map(message => {
      message.sender.isOnline = chat.members
        .find(m => m.id === message.sender.id)?.isOnline;
    });
    return messages;
  }
}
