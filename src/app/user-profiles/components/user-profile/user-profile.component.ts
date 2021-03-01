import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from '../../../shared/models/user';
import {UserService} from '../../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {EditUserDialogComponent} from '../edit-user-dialog/edit-user-dialog.component';
import {AuthenticationService} from '../../../core/services/authentication.service';
import {UserFolloweesService} from '../../services/user-followees.service';
import {UsersDialogComponent} from '../../../shared/components/users-dialog/users-dialog.component';
import {NewsDataSource} from '../../../shared/models/news-data-source';
import {Subscription} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {ToastrService} from 'ngx-toastr';
import {ChatService} from '../../../chats/services/chat.service';
import {Chat} from '../../../chats/models/chat';
import {ChatHubService} from '../../../core/services/chat-hub.service';
import {NotificationHubService} from '../../../core/services/notification-hub.service';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {

  defaultProfilePictureUrl = 'assets/images/default-profile-picture.png';
  user: User;
  currentUser: User;
  followers: User[];
  followees: User[];
  isSubscribed: boolean;
  dataSource: CurrentUserNewsDataSource;
  private userSubscription: Subscription;
  private newFollowerSubscription: Subscription;
  private unsubscribedFollowerSubscription: Subscription;
  private activityStatusSubscription: Subscription;
  baseUrl = environment.fileStorageUrl;

  constructor(private userService: UserService,
              private followeesService: UserFolloweesService,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private authService: AuthenticationService,
              private toastr: ToastrService,
              private chatService: ChatService,
              private chatHub: ChatHubService,
              private notificationHub: NotificationHubService) { }

  ngOnInit(): void {
    this.userSubscription = this.userService.userSubject.subscribe(res =>
    {
      this.user = res;
      this.dataSource?.updateUserInfo(this.user);
    });

    this.route.data.subscribe((data) => {
      this.user = data.user;
      this.dataSource = new CurrentUserNewsDataSource(this.userService, this.user.id, this.toastr);
      this.userService.userSubject.next(data.user);
      this.followers = data.followers;
      this.followees = data.followees;
      this.currentUser = this.authService.getCurrentUserValue();
      if (this.currentUser.id !== this.user.id) {
        this.isSubscribed = !!this.followers.find(f => f.id === this.currentUser.id);
      }
    });

    this.activityStatusSubscription = this.userService.activityStatusSubject.subscribe(v => {
      console.log(v.userId);
      if (this.user.id === v.userId) {
        this.user.isOnline = v.isOnline;
      }
    });

    this.newFollowerSubscription = this.followeesService.newFollowerSubject.subscribe(user => {
      if (user && this.user.id === this.currentUser.id) {
        this.followers.push(user);
        this.toastr.info(user.userName + ' now followed you', 'New follower!');
      }
    });

    this.unsubscribedFollowerSubscription = this.followeesService.unsubscribedFollowerSubject.subscribe(user => {
      if (user && this.user.id === this.currentUser.id) {
        const index = this.followers.findIndex(u => u.id === user.id);
        if (index > -1) {
          this.followers.splice(index, 1);
          this.toastr.info(user.userName + ' unsubscribed', 'Sorry:(');
        }
      }
    });
  }

  openEditDialog(): void {
    this.dialog.open( EditUserDialogComponent, {
      data: this.user
    });
  }

  openFollowersDialog(): void {
    this.dialog.open( UsersDialogComponent, {
      data: {users: this.followers, title: 'Followers'}
    });
  }

  openFolloweesDialog(): void {
    this.dialog.open( UsersDialogComponent, {
      data: {users: this.followees, title: 'Followees'}
    });
  }

  onSubscribe(): void {
    this.followeesService.subscribe(this.currentUser.id, this.user).subscribe(res => {
      console.log('subscribed to ' + res.id);
      this.isSubscribed = true;
      this.followers.push(this.currentUser);
      this.notificationHub.subscribeNews(this.user.id);
      this.notificationHub.notifyAboutBeingSubscribed(this.user.id, this.currentUser);
    });
  }

  onUnsubscribe(): void {
    this.followeesService.unsubscribe(this.currentUser.id, this.user.id).subscribe(res => {
      console.log('unsubscribed');
      this.isSubscribed = false;
      const index = this.followers.findIndex(u => u.id === this.currentUser.id);
      if (index > -1) {
        this.followers.splice(index, 1);
      }
      this.notificationHub.unsubscribeNews(this.user.id);
      this.notificationHub.notifyAboutBeingUnsubscribed(this.user.id, this.currentUser);
    });
  }

  onChatCreate(): void {
    const chat = new Chat();
    chat.name = null;
    chat.isPrivate = true;
    chat.pictureUrl = null;
    chat.members = [this.user, this.authService.getCurrentUserValue()];
    this.chatService.createChat(chat).subscribe(res => {
      console.log(res);
      this.router.navigate(['/chats', res.id]).then(() => {
        this.chatHub.joinChat(res.id);
        this.chatHub.notifyGroupAboutJoining(res, this.currentUser);
        this.chatHub.notifyUserAboutJoining(res, this.user);
      });
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.unsubscribedFollowerSubscription.unsubscribe();
    this.newFollowerSubscription.unsubscribe();
    this.activityStatusSubscription.unsubscribe();
  }
}

export class CurrentUserNewsDataSource extends NewsDataSource {

  constructor(private userService: UserService,
              private userId: string,
              private toastr: ToastrService) {
    super(5);
    this.fetchPageData();
  }

  public fetchPageData(): void {
    this.loading = true;
    this.userService.getPosts(this.userId,
      this.cachedNews.length, this.pageSize).subscribe(res => {
      if (res.length === 0 && this.firstPage) {
        this.toastr.info('No posts yet', 'No news :(');
      } else {
        console.log('loaded');
        this.cachedNews = this.cachedNews.concat(res);
      }
      this.loading = false;
      this.firstPage = false;
    }, () => {
      this.loading = false;
    });
  }

  public updateUserInfo(user: User): void {
    this.cachedNews.forEach(p => p.creator = user);
  }
}
