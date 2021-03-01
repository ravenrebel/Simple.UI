import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from '../../core/services/authentication.service';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
// @ts-ignore
export class AuthenticationGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    | boolean
    | Promise<boolean>
    | Observable<boolean> {

    if (this.authenticationService.isAuthenticated()) {
      return true;
    }

    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
    return false;
  }
}
