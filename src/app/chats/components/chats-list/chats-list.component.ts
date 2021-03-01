import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';

import {AuthenticationService} from '../../../core/services/authentication.service';
import {UserService} from '../../../user-profiles/services/user.service';
import {Chat} from '../../models/chat';
import {ToastrService} from 'ngx-toastr';
import {ChatService} from '../../services/chat.service';
import {ChatHubService} from '../../../core/services/chat-hub.service';
import {Message} from '../../models/message';
import {FormControl, FormGroup} from '@angular/forms';
import {SearchMessagesDialogComponent} from '../search-messages-dialog/search-messages-dialog.component';
import {MessageSearchOptions} from '../../models/message-search-options';
import {MatDialog} from '@angular/material/dialog';
import {CreateChatDialogComponent} from '../create-chat-dialog/create-chat-dialog.component';


@Component({
  selector: 'app-chats-list',
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss']
})
export class ChatsListComponent implements OnInit, OnDestroy {

  chats: Chat[] = [];
  private pageSize: number;
  private deletedChatSubscription: Subscription;
  private chatsUpdatedSubscription: Subscription;
  private removedChatsCount = 0;
  private isLastPage = false;
  private isFirstPage = true;
  searchFormGroup: FormGroup;

  constructor(private userService: UserService,
              private authenticationService: AuthenticationService,
              private toastr: ToastrService,
              private chatService: ChatService,
              private chatHub: ChatHubService,
              private router: Router,
              private dialog: MatDialog,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadChats();

    this.searchFormGroup = new FormGroup({text: new FormControl()});

    this.deletedChatSubscription = this.chatService.deletedChatSubject.subscribe(chat => {
      this.router.navigate(['/chats']).then(() => {
        this.removeChat(chat);
      });
    });

    this.chatsUpdatedSubscription = this.chatService.chatsUpdatedSubject.subscribe(chat => {
      this.moveUpChat(chat);
    });
  }

  ngOnDestroy(): void {
    this.deletedChatSubscription.unsubscribe();
    this.chatsUpdatedSubscription.unsubscribe();
  }

  onScroll(): void {
    if (!this.isLastPage) {
    this.loadChats();
    }
  }

  loadChats(): void {
    this.pageSize = Math.round(window.innerWidth / 100);
    console.log(this.pageSize);
    if (this.isLastPage !== true) {
    this.userService.getChats(this.authenticationService.getCurrentUserValue().id,
      this.chats.length, this.pageSize).subscribe(res => {
        console.log('loaded');
        this.chats = this.chats.concat(res);
        if (res.length < this.pageSize) {
          this.isLastPage = true;
        }
        if (res.length === 0 && this.isFirstPage) {
          this.toastr.info('Find new people to start chatting', 'No chats :( ');
        }

        this.isFirstPage = false;
    });
    }
  }

  private removeChat(chat: Chat): void {
    const index = this.chats.findIndex(c => c.id === chat.id);
    if (index > -1) {
      this.chats.splice(index, 1);
      this.chatHub.leaveChat(chat.id);
      this.toastr.success('You have successfully left', chat.name);
      this.removedChatsCount++;
      if (this.removedChatsCount > this.pageSize / 2) {
        this.loadChats();
        this.removedChatsCount = 0;
      }
    }
  }

  private moveUpChat(chat: Chat): void {
    const index = this.chats.findIndex(c => c.id === chat.id);
    console.log(index);
    switch (index) {
      case -1:
        if (chat.lastMessage || chat.createdAt > this.chats[0].createdAt) {
          this.chats.unshift(chat);
        }
        break;
      case 0:
        if (chat.lastMessage) {
          this.chats[0].lastMessage = chat.lastMessage;
        }
        break;
      default:
        if (chat.lastMessage) {
          this.chats.splice(index, 1);
          this.chats.unshift(chat);
        }
    }
  }

  openSearchMessagesDialog(): void {
    const text = this.searchFormGroup.get('text').value;
    const dialogRef = this.dialog.open(SearchMessagesDialogComponent,
      {data: new MessageSearchOptions(text, this.authenticationService.getCurrentUserValue().id)});
    this.searchFormGroup.reset();

    dialogRef.afterClosed().subscribe((message: Message) => {
      if (message) {
        this.chatService.searchedMessageSubject.next(message);
        // noinspection JSIgnoredPromiseFromCall !important
        this.router.navigate([message.chatId], {relativeTo: this.activatedRoute});
      }
    });
  }

  openCreateChatDialog(): void {
    this.dialog.open(CreateChatDialogComponent);
  }
}

