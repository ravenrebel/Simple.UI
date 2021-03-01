import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable, Subject} from 'rxjs';

import {Post} from '../../shared/models/post';


@Injectable({
  providedIn: 'root'
})// @ts-ignore
export class NewsService {

  constructor(private http: HttpClient) { }

  baseUrl = environment.apiUrl + 'news/';

  public createdPostSubject = new Subject<Post>();
  public removedPostSubject = new Subject<Post>();
  public editedPostSubject = new Subject<Post>();

  public getAllPosts(userId: string, offset: number, limit: number): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl + userId + '/' + offset + '/' + limit);
  }

  public getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(this.baseUrl + id);
  }

  public createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, post);
  }

  public editPost(id: string, post: Post): Observable<Post> {
    return this.http.put<Post>(this.baseUrl + id, post);
  }

  public deletePost(id: string): Observable<string> {
    return this.http.delete<string>(this.baseUrl + id);
  }
}
