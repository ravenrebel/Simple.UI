import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {UserInfoComponent} from './components/user-info/user-info.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatRippleModule} from '@angular/material/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PostComponent} from './components/post/post.component';
import {CreatePostDialogComponent} from './components/create-post-dialog/create-post-dialog.component';
import {QuillModule} from 'ngx-quill';
import {PostsListComponent} from './components/posts-list/posts-list.component';
import {ScrollingModule as ExperimentalScrollingModule} from '@angular/cdk-experimental/scrolling';
import {LoadingSpinnerComponent} from './components/loading-spinner/loading-spinner.component';
import {ConfirmDeleteDialogComponent} from './components/confirm-delete-dialog/confirm-delete-dialog.component';
import {MatBadgeModule} from '@angular/material/badge';
import {MatMenuModule} from '@angular/material/menu';
import { ViewPostDialogComponent } from './components/view-post-dialog/view-post-dialog.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { PostContentComponent } from './components/post-content/post-content.component';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {NgxGalleryModule} from '@kolkov/ngx-gallery';
import {FilePickerModule} from 'ngx-awesome-uploader';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';


const modules = [
  CommonModule,
  ReactiveFormsModule,
  RouterModule,
  MatListModule,
  MatIconModule,
  MatFormFieldModule,
  MatButtonModule,
  MatInputModule,
  MatCardModule,
  MatToolbarModule,
  ScrollingModule,
  ExperimentalScrollingModule,
  MatRippleModule,
  MatDialogModule,
  MatTooltipModule,
  MatBadgeModule,
  MatMenuModule,
  NgxGalleryModule,
  InfiniteScrollModule,
  FilePickerModule,
  QuillModule.forRoot({
    modules: {
      formula: true,
      syntax: true,
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block', 'formula', 'link'],
        [{ list: 'ordered'}, { list: 'bullet' }],
        [{ script: 'sub'}, { script: 'super' }],
        [{ direction: 'rtl' }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ['clean']
      ]
    }
  })
];

@NgModule({
  declarations: [
    UserInfoComponent,
    PostComponent,
    CreatePostDialogComponent,
    PostsListComponent,
    LoadingSpinnerComponent,
    ConfirmDeleteDialogComponent,
    ViewPostDialogComponent,
    PostContentComponent,
    FileUploaderComponent,
  ],
  imports: [
    modules,
    MatExpansionModule,
  ],
  exports: [
    modules,
    UserInfoComponent,
    PostComponent,
    PostsListComponent,
    LoadingSpinnerComponent,
    FileUploaderComponent,
  ]
})

export class SharedModule { }
