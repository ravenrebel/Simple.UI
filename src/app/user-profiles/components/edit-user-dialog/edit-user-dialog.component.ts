import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {User} from '../../../shared/models/user';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../services/user.service';
import {AuthenticationService} from '../../../core/services/authentication.service';
import {FilePreviewModel} from 'ngx-awesome-uploader';
import {FileUploaderComponent} from '../../../shared/components/file-uploader/file-uploader.component';


@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit {
  @ViewChild('fileUploaderComponent', {static: true}) fileUploader: FileUploaderComponent;
  editProfileFormGroup: FormGroup;
  profilePictureChange = false;
  userNameFormControl = new FormControl(this.userData.userName, [
    Validators.required,
    Validators.pattern('^[a-zA-Z0-9_]{0,}'),
    Validators.maxLength(256)
  ]);
  currentProfilePicture: FilePreviewModel;

  constructor(public dialogRef: MatDialogRef<EditUserDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public userData: User,
              private userService: UserService,
              private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.dialogRef.disableClose = true;

    if (this.userData.profilePictureUrl) {
      this.currentProfilePicture = {
        fileId: this.userData.profilePictureUrl,
        fileName: this.userData.profilePictureUrl,
        file: new Blob()
      };
      this.fileUploader.addFile(this.currentProfilePicture);
    }

    this.createForm();
  }

  get uploading(): boolean {
    return this.fileUploader.files?.length ? !this.currentProfilePicture : false;
  }

  onSave(): void {
    if (this.editProfileFormGroup.valid) {
      const editedUser: User = this.editProfileFormGroup.value;
      editedUser.profilePictureUrl = this.currentProfilePicture?.fileId;
      editedUser.id = this.userData.id;
      editedUser.isOnline = this.userData.isOnline;

      this.userService.editProfile(this.userData.id, editedUser).subscribe(res => {
        console.log(res);
        // refresh data
        localStorage.setItem('currentUser', JSON.stringify(res));
        this.authenticationService.getCurrentUserSubject().next(res);
        this.userService.userSubject.next(res);
      });

      this.dialogRef.disableClose = false;
      this.dialogRef.close();
    }
  }

  private createForm(): void {
    this.userNameFormControl.valueChanges.subscribe(v => {
      if (this.userNameFormControl.valid && this.userNameFormControl.value !== this.userData.userName) {
        this.userService.usernameExists(v).subscribe(res => {
          if (res) { this.userNameFormControl.setErrors({taken: true}); }
        });
      }
    });

    this.editProfileFormGroup = new FormGroup({
      lastName: new FormControl(this.userData.lastName, [
        Validators.required,
        Validators.maxLength(256)
      ]),
      firstName: new FormControl(this.userData.firstName, [
        Validators.required,
        Validators.maxLength(256)
      ]),
      userName: this.userNameFormControl
    });
  }

  onFileUpload(filePreviewModel: FilePreviewModel): void {
    console.log('uploaded');
    this.currentProfilePicture = filePreviewModel;
    this.profilePictureChange = true;
  }

  onFileRemoved(filePreviewModel: FilePreviewModel): void {
    console.log('removed');
    this.currentProfilePicture = null;
    this.profilePictureChange = true;
  }

  onCancel(): void {
    this.fileUploader.clearUploadedFiles();

    this.dialogRef.disableClose = false;
    this.dialogRef.close();
  }
}
