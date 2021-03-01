import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {QuillEditorComponent} from 'ngx-quill';
import {FilePreviewModel} from 'ngx-awesome-uploader';

import {Post} from '../../models/post';
import {Attachment} from '../../models/attachment';
import {FileUploaderComponent} from '../file-uploader/file-uploader.component';


@Component({
  selector: 'app-create-post-dialog',
  templateUrl: './create-post-dialog.component.html',
  styleUrls: ['./create-post-dialog.component.scss']
})
export class CreatePostDialogComponent implements OnInit {

  postFormGroup: FormGroup;
  attachmentsChanges = 0;
  @ViewChild('quillEditorComponent', {static: true}) quillEditor: QuillEditorComponent;
  @ViewChild('fileUploaderComponent', {static: true}) fileUploader: FileUploaderComponent;

  constructor(public dialogRef: MatDialogRef<CreatePostDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public postData: Post) { }

  ngOnInit(): void {
    console.log(this.postData);
    this.dialogRef.disableClose = true;

    if (this.postData) {
      if (this.postData.attachments?.length) {
        for (const attachment of this.postData.attachments) {
          const filePreviewModel: FilePreviewModel = {
            fileName: attachment.fileName,
            fileId: attachment.fileUrl,
            file: new Blob()
          };
          this.fileUploader.addFile(filePreviewModel);
        }
      } else {
        this.postData.attachments = [];
      }
    } else {
      this.postData = new Post();
      this.postData.attachments = [];
    }

    this.createForm();
  }

  private createForm(): void {
    this.postFormGroup = new FormGroup({
        header: new FormControl(this.postData.header, Validators.maxLength(100)),
        text: new FormControl(this.postData.text, Validators.maxLength(2000)),
    });
  }

  onSave(): void {
    if (this.postFormGroup.valid) {
      // refresh
      this.postData.header = this.postFormGroup.get('header').value;
      this.postData.text = this.postFormGroup.get('text').value;

      this.dialogRef.disableClose = false;
      this.dialogRef.close(this.postData);
    }
  }

  onCancel(): void {
    this.fileUploader.clearUploadedFiles();

    this.dialogRef.disableClose = false;
    this.dialogRef.close();
  }

  onFileUpload(filePreviewModel: FilePreviewModel): void {
    console.log('uploaded');
    this.attachmentsChanges++;
    const attachment = new Attachment();
    attachment.fileUrl = filePreviewModel.fileId;
    attachment.fileName = filePreviewModel.fileName;
    console.log(attachment);
    this.postData.attachments.push(attachment);
  }

  onFileRemoved(filePreviewModel: FilePreviewModel): void {
    console.log('removed');
    this.attachmentsChanges++;
    const attachmentIndex = this.postData.attachments
      .findIndex(f => f.fileUrl === filePreviewModel.fileId);
    if (attachmentIndex > -1) {
      this.postData.attachments.splice(attachmentIndex, 1);
    }
  }
}
