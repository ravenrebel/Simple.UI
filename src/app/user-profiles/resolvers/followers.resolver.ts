import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {User} from '../../shared/models/user';
import {Observable} from 'rxjs';
import {UserFolloweesService} from '../services/user-followees.service';

@Injectable({ providedIn: 'root' })
export class FollowersResolver implements Resolve<User> {
  constructor(private service: UserFolloweesService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.service.getFollowers(route.paramMap.get('id'));
  }
}
