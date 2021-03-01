import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {UsersComponent} from './components/users/users.component';
import {UserProfileComponent} from './components/user-profile/user-profile.component';
import {UserResolver} from './resolvers/user.resolver';
import {FollowersResolver} from './resolvers/followers.resolver';
import {FolloweesResolver} from './resolvers/followees.resolver';


const routes: Routes = [
  {
    path: '',
    component: UsersComponent
  },
  {
    path: ':id',
    component: UserProfileComponent,
    resolve: {
      user: UserResolver,
      followers: FollowersResolver,
      followees: FolloweesResolver
    }
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
// @ts-ignore
export class UserProfilesRoutingModule { }
