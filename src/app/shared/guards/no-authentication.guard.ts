import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {AuthenticationService} from '../../core/services/authentication.service';

@Injectable({ providedIn: 'root' })
// @ts-ignore
export class NoAuthenticationGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authenticationService.isAuthenticated()) {
      return true;
    }

    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/home'], {queryParams: {returnUrl: state.url}});
    return false;
  }
}
