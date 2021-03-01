import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';

import {User} from '../../shared/models/user';


@Injectable({
  providedIn: 'root'
})// @ts-ignore
export class UserFolloweesService {

  public newFollowerSubject = new Subject<User>();
  public unsubscribedFollowerSubject = new Subject<User>();

  constructor(private http: HttpClient) { }

  baseUrl = environment.apiUrl + 'userfollowees/';

  public getFollowers(id: string, offset?: number, limit?: number): Observable<User[]> {
    let searchParams = new HttpParams();
    if (offset && limit) {
      searchParams = searchParams.append('offset', offset.toString())
        .append('limit', limit.toString());
    }
    return this.http.get<User[]>(this.baseUrl + id + '/followers',
      {
        params: searchParams
      });
  }

  public getFollowees(id: string, offset?: number, limit?: number): Observable<User[]> {
    let searchParams = new HttpParams();
    if (offset && limit) {
      searchParams = searchParams.append('offset', offset.toString())
        .append('limit', limit.toString());
    }
    return this.http.get<User[]>(this.baseUrl + id + '/followees',
      {
        params: searchParams
      });
  }

  public subscribe(followerId: string, userToSubscribe: User): Observable<User> {
    return this.http.post<User>(this.baseUrl + followerId, userToSubscribe);
  }

  public unsubscribe(followerId: string, followeeId: string): Observable<any> {
    return this.http.delete(this.baseUrl + followerId + '/' + followeeId);
  }
}
