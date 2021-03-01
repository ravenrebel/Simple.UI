import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {CreatePostDialogComponent} from '../../../shared/components/create-post-dialog/create-post-dialog.component';
import {NewsService} from '../../../news-board/services/news.service';
import {User} from '../../../shared/models/user';
import {ToastrService} from 'ngx-toastr';
import {Subscription} from 'rxjs';
import {ChatService} from '../../../chats/services/chat.service';
import {NotificationHubService} from '../../services/notification-hub.service';
import {FormControl, FormGroup} from '@angular/forms';
import {PushNotificationsService} from '../../services/push-notifications.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  currentUser: User;
  private chatsUpdatedSubscription: Subscription;
  unreadMessagesCount = 0;
  notificationsFormGroup: FormGroup;
  notificationFormControl = new FormControl();
  isSubscriptionValueSet = false;

  constructor(private authService: AuthenticationService,
              private newsService: NewsService,
              private router: Router,
              private dialog: MatDialog,
              private toastr: ToastrService,
              private chatService: ChatService,
              private notificationHub: NotificationHubService,
              private pushNotificationsService: PushNotificationsService) {
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserValue();

    this.chatsUpdatedSubscription = this.chatService.chatsUpdatedSubject.subscribe(v => {
      if (v.lastMessage?.sender.id !== this.currentUser.id && !this.router.url.includes( '/chats')) {
        this.unreadMessagesCount++;
      }
    });

    this.createFormGroup();
  }

  createFormGroup(): void {
    this.notificationsFormGroup = new FormGroup({
      notifications: this.notificationFormControl
    });

    this.notificationFormControl.valueChanges.subscribe(value => {
      if (this.isSubscriptionValueSet) {
        if (value) {
          this.pushNotificationsService.requestSubscription();
        } else {
          this.pushNotificationsService.unsubscribeNotifications();
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
    console.log('User is logged out');
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/login']);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open( CreatePostDialogComponent, {
    });

    dialogRef.afterClosed().subscribe(postData => {
      console.log('The dialog was closed');
      if (postData) {
        postData.creator = this.authService.getCurrentUserValue();
        this.newsService.createPost(postData).subscribe(res => {
          console.log(res);
          this.newsService.createdPostSubject.next(res);
          this.notificationHub.NotifyAboutPostCreation(res);
          this.toastr.success('Post was successfully created', 'Created');
        });
      }
    });
  }

  setSubscriptionValue(): void {
    if (!this.isSubscriptionValueSet) {
      this.notificationFormControl.setValue(this.pushNotificationsService.subscriptionSubject.value);
      this.isSubscriptionValueSet = true;
    }
  }
}
