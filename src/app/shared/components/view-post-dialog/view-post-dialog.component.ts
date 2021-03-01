import {Component, Inject, OnInit} from '@angular/core';
import {Post} from '../../models/post';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-post-details-dialog',
  templateUrl: './view-post-dialog.component.html',
  styleUrls: ['./view-post-dialog.component.scss']
})
export class ViewPostDialogComponent implements OnInit {
  baseUrl = environment.fileStorageUrl;

  constructor(@Inject(MAT_DIALOG_DATA) public post: Post) { }

  ngOnInit(): void {
  }

}
