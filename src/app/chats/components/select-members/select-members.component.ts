import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {COMMA, ENTER, SPACE} from '@angular/cdk/keycodes';
import {FormControl, FormGroup} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';

import {environment} from '../../../../environments/environment';
import {User} from '../../../shared/models/user';
import {UserService} from '../../../user-profiles/services/user.service';
import {AuthenticationService} from '../../../core/services/authentication.service';


@Component({
  selector: 'app-select-members',
  templateUrl: './select-members.component.html',
  styleUrls: ['./select-members.component.scss']
})
export class SelectMembersComponent implements OnInit {
  @Input() chatMembers: User[];
  @Input() selectedUsers: User[] = [];
  @ViewChild('userNameInput') userNameInput: ElementRef<HTMLInputElement>;
  separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  filteredOptions: User[];
  userNameFormControl = new FormControl();
  addMemberFormGroup: FormGroup;
  defaultProfilePictureUrl = 'assets/images/default-profile-picture.webp';
  baseUrl = environment.fileStorageUrl;

  constructor(private userService: UserService,
              private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.userNameFormControl.valueChanges.subscribe(value => {
      if (value) {
        this.userService.findByUserName(0, 5, value).subscribe(res => {
          console.log('loaded');
          this.filteredOptions = res.filter((user) => this.authService.getCurrentUserValue().id !== user.id &&
            this.selectedUsers.findIndex((selected) => selected.id === user.id) === -1 &&
            this.chatMembers.findIndex((member) => member.id === user.id) === -1);
        });
      }
    });
    this.addMemberFormGroup = new FormGroup({name: this.userNameFormControl});
  }

  addUser(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      const user = this.filteredOptions.find((u) => u.userName === value.trim());
      if (user) {
        this.selectedUsers.push(user);
      }
    }

    if (input) {
      input.value = '';
    }

    this.userNameFormControl.setValue(null);
  }

  removeUser(user: User): void {
    const index = this.selectedUsers.indexOf(user);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    }
  }

  selectUser(event: MatAutocompleteSelectedEvent): void {
    this.selectedUsers.push(event.option.value);
    this.userNameInput.nativeElement.value = '';
    this.userNameFormControl.setValue(null);
  }
}
