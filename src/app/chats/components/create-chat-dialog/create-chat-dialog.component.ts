import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {User} from '../../../shared/models/user';
import {Chat} from '../../models/chat';
import {ChatService} from '../../services/chat.service';
import {AuthenticationService} from '../../../core/services/authentication.service';
import {ChatHubService} from '../../../core/services/chat-hub.service';
import {Message} from '../../models/message';


@Component({
  selector: 'app-create-chat',
  templateUrl: './create-chat-dialog.component.html',
  styleUrls: ['./create-chat-dialog.component.scss']
})
export class CreateChatDialogComponent implements OnInit {
  createChatFormGroup: FormGroup;
  selectedUsers: User[] = [];

  constructor(private chatService: ChatService,
              private authService: AuthenticationService,
              private chatHub: ChatHubService,
              private router: Router) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.createChatFormGroup = new FormGroup({
      name: new FormControl('', Validators.maxLength(50)),
      message: new FormControl('')
    });
  }

  onCreate(): void {
    const chat: Chat = new Chat();
    chat.members = this.selectedUsers;
    chat.members.push(this.authService.getCurrentUserValue());
    if (chat.members.length <= 2) {
      chat.isPrivate = true;
    } else {
      chat.name = this.createChatFormGroup.get('name').value;
    }

    this.chatService.createChat(chat).subscribe(res => {
      console.log('chat created!');

      this.chatHub.joinChat(res.id);
      this.selectedUsers.forEach(member => {
        this.chatHub.notifyUserAboutJoining(res, member);
      });

      const text = this.createChatFormGroup.get('message').value;
      if (!text.match('^ *$')) {
        this._sendMessage(text, res);
      } else {
        this.router.navigate(['/chats/' + res.id]).then(() => {
          this.chatHub.notifyAboutChatsUpdate(res);
          this.chatService.chatsUpdatedSubject.next(res);
        });
      }
    });
  }

  private _sendMessage(text: string, chat: Chat): void {
    const message = new Message();
    message.text = text;
    message.sender = this.authService.getCurrentUserValue();
    message.chatId = chat.id;

    this.chatService.createMessage(message).subscribe(res => {
      chat.lastMessage = res;
      this.chatHub.notifyAboutChatsUpdate(chat);

      this.router.navigate(['/chats/' + chat.id]).then(() => {
        this.chatService.chatsUpdatedSubject.next(chat);
      });
    });
  }
}
