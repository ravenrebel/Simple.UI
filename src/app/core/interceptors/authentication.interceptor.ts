import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthenticationService} from '../services/authentication.service';
import {environment} from '../../../environments/environment';


@Injectable()
// @ts-ignore
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor(private authenticationService: AuthenticationService,) {
  }

  intercept(req: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {

    const isApiUrl = req.url.startsWith(environment.apiUrl);

    if (this.authenticationService.isAuthenticated() && isApiUrl) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization',
          'Bearer ' + this.authenticationService.getCurrentTokenValue())
      });

      return next.handle(cloned);
    }
    else {
      return next.handle(req);
    }
  }
}
