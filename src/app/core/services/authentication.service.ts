import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LoginData} from '../models/authentication/login-data';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {RegisterData} from '../models/authentication/register-data';
import {User} from '../../shared/models/user';
import {AuthResult} from '../models/authentication/auth-result';
import {ChatHubService} from './chat-hub.service';
import {NotificationHubService} from './notification-hub.service';
import {OnlineUsersHubService} from './online-users-hub.service';
import {PushNotificationsService} from './push-notifications.service';
import {isPlatformBrowser} from '@angular/common';
import {UserService} from '../../user-profiles/services/user.service';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private readonly currentUserSubject: BehaviorSubject<User>;
  private readonly currentAccessTokenSubject: BehaviorSubject<string>;
  private readonly currentRefreshTokenSubject: BehaviorSubject<string>;
  private readonly isBrowser: boolean;

  constructor(private http: HttpClient,
              private userService: UserService,
              private chatHub: ChatHubService,
              private homeHub: NotificationHubService,
              private onlineUsersHub: OnlineUsersHubService,
              private pushNotificationsService: PushNotificationsService,
              @Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
      this.currentRefreshTokenSubject = new BehaviorSubject<string>(localStorage.getItem('refreshToken'));
      this.currentAccessTokenSubject = new BehaviorSubject<string>(localStorage.getItem('accessToken'));
    }
  }

  baseUrl = environment.apiUrl + 'account';

  public getCurrentTokenValue(): string {
    return this.currentAccessTokenSubject?.value;
  }

  public getCurrentUserValue(): User {
    return this.currentUserSubject?.value;
  }

  public getCurrentUserSubject(): BehaviorSubject<User> {
    return this.currentUserSubject;
  }

  public authenticate(login: LoginData): Observable<AuthResult> {
    return this.http.post<AuthResult>(this.baseUrl + '/authenticate', login)
      .pipe(map(userInfo => {
          this._setSession(userInfo);
          return userInfo;
        })
      );
  }

  public isAuthenticated(): boolean {
    return !!(this.currentRefreshTokenSubject?.value && this.currentAccessTokenSubject?.value && this.getCurrentUserValue());
  }

  public register(register: RegisterData): Observable<AuthResult> {
    return this.http.post<AuthResult>(this.baseUrl + '/register', register)
      .pipe(map(userInfo => {
          this._setSession(userInfo);
          return userInfo;
        })
      );
  }

  private _setSession(authResult: AuthResult): void {
    this.currentUserSubject.next(authResult.user);
    this.currentAccessTokenSubject.next(authResult.accessToken);
    this.currentRefreshTokenSubject.next(authResult.refreshToken);

    this.pushNotificationsService.subscribeNotifications();

    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(authResult.user));
      localStorage.setItem('refreshToken', authResult.refreshToken);
      localStorage.setItem('accessToken', authResult.accessToken);
    }

    this.onlineUsersHub.startConnection(authResult.accessToken);
    this.onlineUsersHub.getRefreshedStatus(this.getCurrentUserValue());

    this.chatHub.startConnection(authResult.accessToken);
    this.chatHub.getNotificationsAboutChatsUpdates();
    this.chatHub.getNotificationsAboutBeingJoined();
    this.chatHub.getNotificationsAboutLeaving();
    this.chatHub.getNotificationsAboutJoining();
    this.chatHub.getNotificationsAboutChatEditing();

    this.homeHub.startConnection(authResult.accessToken);
    this.homeHub.getNotificationsAboutPostCreation();
    this.homeHub.getNotificationsAboutPostRemoval();
    this.homeHub.getNotificationsAboutPostEditing();
    this.homeHub.getNotificationsAboutNewFollower();
    this.homeHub.getNotificationsAboutUnsubscribedFollower();
  }

  public logout(): void {
    const id = this.getCurrentUserValue()?.id;
    this.currentUserSubject.next(null);
    this.currentAccessTokenSubject.next(null);
    this.currentRefreshTokenSubject.next(null);

    const endpoint = this.pushNotificationsService.subscriptionSubject.value?.endpoint;
    if (endpoint) {
      this.pushNotificationsService.deleteSubscription(endpoint);
    }

    this.chatHub.stopConnection();
    this.homeHub.stopConnection();
    this.onlineUsersHub.stopConnection();

    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
    }

    this.http.post(this.baseUrl + '/revoke-token/' + id, {}).subscribe();
  }

  public refreshToken(): Observable<AuthResult> {
    const localRefreshToken = this.currentRefreshTokenSubject.value;
    const currentUser = this.getCurrentUserValue();

    if (localRefreshToken && currentUser) {
      return this.http.post<AuthResult>(this.baseUrl + '/refresh-token', {
      userId: currentUser.id,
      refreshToken: localRefreshToken
    }).pipe(map((userInfo) => {
        this._setSession(userInfo);
        return userInfo;
      }));
    }
  }
}
