import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../models/user';
import {environment} from '../../../../environments/environment';


@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent {

  @Input() user: User;
  online = true;
  defaultProfilePictureUrl = 'assets/images/default-profile-picture.png';
  baseUrl = environment.fileStorageUrl;
}
