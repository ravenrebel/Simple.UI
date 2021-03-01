import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Message} from '../../models/message';
import {environment} from '../../../../environments/environment';
import {Subscription} from 'rxjs';
import {UserService} from '../../../user-profiles/services/user.service';


@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit, OnDestroy {

  @Input() message: Message;
  defaultProfilePictureUrl = 'assets/images/default-profile-picture.webp';
  baseUrl = environment.fileStorageUrl;
  private activityStatusSubscription: Subscription;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.activityStatusSubscription = this.userService.activityStatusSubject.subscribe(v => {
      if (this.message.sender.id === v.userId) {
        this.message.sender.isOnline = v.isOnline;
      }
    });
  }

  ngOnDestroy(): void {
    this.activityStatusSubscription.unsubscribe();
  }

}
