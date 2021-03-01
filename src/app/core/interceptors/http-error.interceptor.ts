import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import {Injectable} from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {MatDialog} from '@angular/material/dialog';
import {RestoreSessionDialogComponent} from '../components/restore-session-dialog/restore-session-dialog.component';
import {UnauthorizedHandlingService} from '../services/unauthorized-handling.service';


@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private toastr: ToastrService,
              private authenticationService: AuthenticationService,
              private handlingService: UnauthorizedHandlingService,
              private dialog: MatDialog) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 && this.authenticationService.getCurrentUserValue()) {
            if (error.error === 'Invalid token') {
              this.dialog.closeAll();
              console.log('all closed');
              const subscription = this.dialog.afterAllClosed.subscribe( res => {
                if (this.dialog.openDialogs.length === 0) {
                  console.log('login');
                  this.dialog.open(RestoreSessionDialogComponent, {disableClose: true});
                  subscription.unsubscribe();
                }
              });
            }
            else {
              return this.handlingService.handleUnauthorized(request, next);
            }
          }
          else {
            let errorMessage: string;

            if (error.error instanceof ErrorEvent) {
              errorMessage = `${error.error.message}`;
            } else if (!error.error) {
              errorMessage = `${error.status} ${error.statusText}`;
            } else if (!error.status) {
              errorMessage = error.statusText;
            } else {
              errorMessage = `${error.status} ${error.error}`;
            }

            this.toastr.error(errorMessage, 'Error!');
            console.error(error);
            return throwError(errorMessage);
          }
        })
      );
  }
}
