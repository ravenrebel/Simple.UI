import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import {User} from '../../../shared/models/user';
import {UserService} from '../../../user-profiles/services/user.service';
import {ChatService} from '../../services/chat.service';
import {ToastrService} from 'ngx-toastr';
import {ChatHubService} from '../../../core/services/chat-hub.service';
import {Chat} from '../../models/chat';

@Component({
  selector: 'app-add-chat-member-dialog',
  templateUrl: './add-chat-member-dialog.component.html',
  styleUrls: ['./add-chat-member-dialog.component.scss']
})
export class AddChatMemberDialogComponent implements OnInit {
  selectedUsers: User[] = [];

  constructor(private userService: UserService,
              private chatService: ChatService,
              private toastr: ToastrService,
              private chatHub: ChatHubService,
              @Inject(MAT_DIALOG_DATA) public chat: Chat) { }

  ngOnInit(): void {
  }

  onAddMembers(): void {
    if (this.selectedUsers.length) {
      this.selectedUsers.forEach(selectedUser => {
        if (selectedUser) {
          this.chatService.addChatMember(this.chat.id, selectedUser).subscribe(res => {
            this.chatHub.notifyGroupAboutJoining(this.chat, res);
            this.chatHub.notifyUserAboutJoining(this.chat, res);
            this.chatService.joinChatSubject.next({chat: this.chat, user: res});
          });
        } else {
          this.toastr.error('Please enter a correct username', 'Error!');
        }
      });
    }
  }
}
