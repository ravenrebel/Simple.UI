import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {User} from '../../shared/models/user';
import {UserService} from '../services/user.service';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserResolver implements Resolve<User> {

  constructor(private userService: UserService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.userService.getById(route.paramMap.get('id'));
  }
}
