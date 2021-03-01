import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FilePreviewModel} from 'ngx-awesome-uploader';

import {ChatService} from '../../services/chat.service';
import {Chat} from '../../models/chat';
import {ChatHubService} from '../../../core/services/chat-hub.service';
import {FileUploaderComponent} from '../../../shared/components/file-uploader/file-uploader.component';


@Component({
  selector: 'app-edit-chat-dialog',
  templateUrl: './edit-chat-dialog.component.html',
  styleUrls: ['./edit-chat-dialog.component.scss']
})
export class EditChatDialogComponent implements OnInit {
  editChatFormGroup: FormGroup;
  isModified = false;
  pictureChange = false;
  currentPicture: FilePreviewModel;
  @ViewChild('fileUploaderComponent', {static: true}) fileUploader: FileUploaderComponent;

  constructor(private chatService: ChatService,
              private chatHub: ChatHubService,
              @Inject(MAT_DIALOG_DATA) public chatData: Chat,
              public dialogRef: MatDialogRef<EditChatDialogComponent>) { }

  ngOnInit(): void {
    this.dialogRef.disableClose = true;

    if (this.chatData.pictureUrl) {
      this.currentPicture = {
        fileId: this.chatData.pictureUrl,
        fileName: this.chatData.pictureUrl,
        file: new Blob()
      };
      this.fileUploader.addFile(this.currentPicture);
    }

    this.editChatFormGroup = new FormGroup({
      name: new FormControl(this.chatData.name, Validators.maxLength(50))
    });

    this.dialogRef.afterClosed().subscribe(() => {
      if (this.isModified) {
        this.chatService.editedChatSubject.next(this.chatData);
        this.chatHub.notifyAboutChatEditing(this.chatData);
      }
    });
  }

  get uploading(): boolean {
    return this.fileUploader.files?.length ? !this.currentPicture : false;
  }

  onSave(): void {
    if (this.editChatFormGroup.valid) {
      this.isModified = true;
      this.chatData.name = this.editChatFormGroup.get('name').value;
      this.chatData.pictureUrl = this.currentPicture?.fileId;

      this.chatService.editChat(this.chatData.id, this.chatData).subscribe(res => {
        console.log(res);
      });

      this.dialogRef.disableClose = false;
      this.dialogRef.close();
    }
  }

  // TODO: not dry
  onFileUpload(filePreviewModel: FilePreviewModel): void {
    console.log('uploaded');
    this.currentPicture = filePreviewModel;
    this.pictureChange = true;
  }

  onFileRemoved(filePreviewModel: FilePreviewModel): void {
    console.log('removed');
    this.currentPicture = null;
    this.pictureChange = true;
  }

  onCancel(): void {
    this.fileUploader.clearUploadedFiles();

    this.dialogRef.disableClose = false;
    this.dialogRef.close();
  }
}
