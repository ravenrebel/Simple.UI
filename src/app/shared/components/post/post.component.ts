import {Component, Input, OnInit} from '@angular/core';
import {Post} from '../../models/post';
import {AuthenticationService} from '../../../core/services/authentication.service';
import {NewsService} from '../../../news-board/services/news.service';
import {CreatePostDialogComponent} from '../create-post-dialog/create-post-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {User} from '../../models/user';
import {ToastrService} from 'ngx-toastr';
import {ConfirmDeleteDialogComponent} from '../confirm-delete-dialog/confirm-delete-dialog.component';
import {NotificationHubService} from '../../../core/services/notification-hub.service';
import {ViewPostDialogComponent} from '../view-post-dialog/view-post-dialog.component';
import {environment} from '../../../../environments/environment';


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

  @Input() post: Post;
  currentUser: User;
  baseUrl = environment.fileStorageUrl;

  constructor(private authenticationService: AuthenticationService,
              private newsService: NewsService,
              private dialog: MatDialog,
              private toastr: ToastrService,
              private notificationHub: NotificationHubService) { }

  ngOnInit(): void {
    this.currentUser = this.authenticationService.getCurrentUserValue();
  }

  onEdit(): void {
    console.log(this.post.attachments);
    const dialogRef = this.dialog.open(CreatePostDialogComponent, {
      data: this.post
    });

    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if (data) {
        this.post.header = data.header;
        this.post.text = data.text;
        this.post.attachments = data.attachments;

        this.newsService.editPost(this.post.id, this.post).subscribe(res => {
          console.log(res);
          this.toastr.success('Post was successfully edited', 'Saved');
          this.newsService.editedPostSubject.next(res);
          this.notificationHub.NotifyAboutPostEditing(this.post);
        });
      }
    });
  }

  onDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.newsService.removedPostSubject.next(this.post);
        this.notificationHub.NotifyAboutPostRemoval(this.post);
        this.newsService.deletePost(this.post.id).subscribe(res => {
          console.log('deleted!');
          this.toastr.success('Your post was successfully deleted ', 'Deleted!');
        });
      }
    });
  }

  openViewPostDialog(): void {
    this.dialog.open(ViewPostDialogComponent, {data: this.post});
  }
}
