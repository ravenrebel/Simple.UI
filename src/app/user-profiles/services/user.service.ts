import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable, Subject} from 'rxjs';

import {User} from '../../shared/models/user';
import {Post} from '../../shared/models/post';
import {Chat} from '../../chats/models/chat';


@Injectable({
  providedIn: 'root'
})// @ts-ignore
export class UserService {

  constructor(private http: HttpClient) {}

  baseUrl = environment.apiUrl + 'users/';
  public userSubject = new Subject<User>();
  public activityStatusSubject = new Subject<{isOnline: boolean, userId: string}>();

  public getByName(offset: number, limit: number, name?: string): Observable<User[]> {
    let searchParams = new HttpParams();
    if (name) {
      searchParams = searchParams.append('name', name);
    }
    return this.http.get<User[]>(this.baseUrl + 'search/' + offset + '/' + limit,
      {
        params: searchParams
      });
  }

  public getById(id: string): Observable<User> {
    return this.http.get<User>(this.baseUrl + id);
  }

  public editProfile(id: string, user: User): Observable<User> {
    return this.http.put<User>(this.baseUrl + id, user);
  }

  public deleteProfile(id: string): Observable<string> {
    return this.http.delete<string>(this.baseUrl + id);
  }

  public getPosts(id: string, offset: number, limit: number): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl + id + '/posts/' + offset + '/' + limit);
  }

  public getChats(id: string, offset?: number, limit?: number): Observable<Chat[]> {
    let searchParams = new HttpParams();
    if (offset !== null && limit) {
      searchParams = searchParams.append('offset', offset.toString())
        .append('limit', limit.toString());
    }
    return this.http.get<Chat[]>(this.baseUrl + id + '/chats',
      {
        params: searchParams
      });
  }

  public usernameExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(this.baseUrl + 'username-existence/' + username);
  }

  public emailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(this.baseUrl + 'email-existence/' + email);
  }

  public findByUserName(offset: number, limit: number, userName: string): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl + userName + '/' + offset + '/' + limit);
  }
}
