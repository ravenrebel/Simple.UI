import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpHandler, HttpRequest} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, filter, finalize, switchMap, take} from 'rxjs/operators';
import {AuthenticationService} from './authentication.service';
import {AuthResult} from '../models/authentication/auth-result';


@Injectable({
  providedIn: 'root'
})// @ts-ignore
export class UnauthorizedHandlingService {

  isRefreshingToken = false;
  authResultBehaviorSubject: BehaviorSubject<AuthResult> = new BehaviorSubject<AuthResult>(null);

  constructor(private authenticationService: AuthenticationService) { }

  handleUnauthorized(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;
      this.authResultBehaviorSubject.next(null);

      return this.authenticationService.refreshToken()
        .pipe(switchMap((authResult: AuthResult) => {
            if (authResult) {
              this.authenticationService.getCurrentUserSubject().next(authResult.user);
              this.authResultBehaviorSubject.next(authResult);
              return next.handle(this.addHeader(req, authResult.accessToken));
            }
            this.authenticationService.logout();
          }), catchError((error: HttpErrorResponse) => {
            this.authenticationService.logout();
            return throwError(error);
          }), finalize(() => {
            this.isRefreshingToken = false;
          })
        );
    } else {
      return this.authResultBehaviorSubject
        .pipe(
          filter(authResult => authResult != null),
          take(1),
          switchMap(authResult => {
            return next.handle(this.addHeader(req, authResult.accessToken));
          })
        );
    }
  }

  addHeader(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      headers: req.headers.set('Authorization',
        'Bearer ' + token)
    });
  }
}
