import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../../environments/environment';

import {Chat} from '../../models/chat';
import {ChatService} from '../../services/chat.service';
import {AuthenticationService} from '../../../core/services/authentication.service';
import {UserService} from '../../../user-profiles/services/user.service';
import {User} from '../../../shared/models/user';

@Component({
  selector: 'app-chat-info',
  templateUrl: './chat-info.component.html',
  styleUrls: ['./chat-info.component.scss']
})
export class ChatInfoComponent implements OnInit, OnDestroy {

  @Input() chat: Chat;
  interlocutor: User;
  name: string;
  defaultChatPictureUrl = 'assets/images/chat-default.png';
  baseUrl = environment.fileStorageUrl;
  private chatsUpdatedSubscription: Subscription;
  private readMessagesSubscription: Subscription;
  private editedChatSubscription: Subscription;
  private activityStatusSubscription: Subscription;
  private joinChatSubscription: Subscription;
  private leftChatSubscription: Subscription;

  constructor(private chatService: ChatService,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private userService: UserService) { }

  ngOnInit(): void {
    if (this.chat.isPrivate) {
      this.interlocutor = this.chatService.getChatInterlocutor(this.chat, this.authenticationService.getCurrentUserValue());
      this.name = this.interlocutor?.userName;
      this.chat.pictureUrl = this.interlocutor?.profilePictureUrl;
    }
    else {
      if (!this.chat.name) {
        this._setDefaultName();
      }
      else {
        this.name = this.chat.name;
      }
    }

    this.chatsUpdatedSubscription = this.chatService.chatsUpdatedSubject.subscribe(chat => {
      if (this.chat.id === chat.id && chat.lastMessage
        && chat.lastMessage?.sender.id !== this.authenticationService.getCurrentUserValue().id) {
        // TODO: better condition
        if (this.chat.id !== this.route.children[0]?.snapshot.params.id) {
          this.chat.unreadMessagesCount++;
        }
      }
    });

    this.readMessagesSubscription = this.chatService.readMessagesSubject.subscribe(id => {
      if (this.chat.id === id) {
        this.chat.unreadMessagesCount = 0;
      }
    });

    this.activityStatusSubscription = this.userService.activityStatusSubject.subscribe(v => {
      if (this.chat.isPrivate && this.interlocutor.id === v.userId) {
        this.interlocutor.isOnline = v.isOnline;
      }
    });

    this.editedChatSubscription = this.chatService.editedChatSubject.subscribe(chat => {
      if (this.chat.id === chat.id) {
        this.chat.name = chat.name;
        this.chat.pictureUrl = chat.pictureUrl;
        if (!this.chat.name) {
          this._setDefaultName();
        }
        else {
          this.name = this.chat.name;
        }
      }
    });

    this.joinChatSubscription = this.chatService.joinChatSubject.subscribe(v => {
      if (v.chat.id === this.chat.id) {
        if (this.chat.members.findIndex(m => m.id === v.user.id) === -1) {
          this.chat.members.push(v.user);
          if (v.chat.isPrivate && this.chat.members.length > 2) {
            this.chat.isPrivate = false;
            this.chat.pictureUrl = null;
            this._setDefaultName();
          }
          else if (!this.chat.name){
            this.name = v.user.userName + ' ' + this.name;
          }
        }
      }
    });

    this.leftChatSubscription = this.chatService.leftChatSubject.subscribe(v => {
      if (v.chat.id === this.chat.id) {
        if (this.authenticationService.getCurrentUserValue().id !== v.user.id) {
          const memberIndex = this.chat.members.findIndex((user) => user.id === v.user.id);
          if (memberIndex > -1) {
            this.chat.members.splice(memberIndex, 1);
            if (this.chat.members.length <= 1) {
              this.chatService.deletedChatSubject.next(v.chat);
            } else if (!this.chat.name) {
              const nameIndex = this.name.indexOf(v.user.userName);
              if (nameIndex > -1) {
                this.name = this.name.substring(0, nameIndex)
                  + this.name.substring(v.user.userName.length + 1, this.name.length - 1);
              }
            }
          }
        } else {
          this.chatService.deletedChatSubject.next(v.chat);
        }
      }
    });
  }

  private _setDefaultName(): void {
    this.name = '';
    this.chat.members.forEach(m => this.name += m?.userName + ' ');
    console.log(this.name);
  }

  ngOnDestroy(): void {
    this.chatsUpdatedSubscription.unsubscribe();
    this.readMessagesSubscription.unsubscribe();
    this.activityStatusSubscription.unsubscribe();
    this.editedChatSubscription.unsubscribe();
    this.joinChatSubscription.unsubscribe();
    this.leftChatSubscription.unsubscribe();
  }
}
