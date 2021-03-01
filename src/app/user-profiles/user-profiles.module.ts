import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { UsersComponent } from './components/users/users.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UserProfilesRoutingModule } from './user-profiles-routing.module';
import { EditUserDialogComponent } from './components/edit-user-dialog/edit-user-dialog.component';
import { UsersDialogComponent } from '../shared/components/users-dialog/users-dialog.component';


@NgModule({
  declarations: [
    UsersComponent,
    UserProfileComponent,
    EditUserDialogComponent,
    UsersDialogComponent
  ],
  imports: [
    SharedModule,
    UserProfilesRoutingModule,
  ],
})
// @ts-ignore
export class UserProfilesModule { }
