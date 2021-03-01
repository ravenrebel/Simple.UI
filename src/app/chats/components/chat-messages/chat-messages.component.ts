import {Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {tap} from 'rxjs/operators';

import {ChatService} from '../../services/chat.service';
import {Chat} from '../../models/chat';
import {Message} from '../../models/message';
import {AuthenticationService} from '../../../core/services/authentication.service';
import {User} from '../../../shared/models/user';
import {MatDialog} from '@angular/material/dialog';
import {AddChatMemberDialogComponent} from '../add-chat-member-dialog/add-chat-member-dialog.component';
import {ChatHubService} from '../../../core/services/chat-hub.service';
import {ToastrService} from 'ngx-toastr';
import {ChatScrollDirective} from '../../directives/chat-scroll.directive';
import {UsersDialogComponent} from '../../../shared/components/users-dialog/users-dialog.component';
import {EditChatDialogComponent} from '../edit-chat-dialog/edit-chat-dialog.component';
import {UserService} from '../../../user-profiles/services/user.service';
import {SearchMessagesDialogComponent} from '../search-messages-dialog/search-messages-dialog.component';
import {MessageSearchOptions} from '../../models/message-search-options';


@Component({
  selector: 'app-chat-messages',
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.scss'],
  animations: [
    trigger('messageState', [
      state('searched', style({
        'background-color': 'white',
      })),
      transition('* => searched', [animate(100),
      style({
        'background-color': 'yellow',
      }), animate(1000)])
    ])
  ]
})// @ts-ignore
export class ChatMessagesComponent implements OnInit, OnDestroy {

  messageFormGroup: FormGroup;
  chat: Chat;
  messages: Message[];
  currentUser: User;
  searchFormGroup: FormGroup;
  searchedMessageId: string;
  private pageSize: number;
  private isLastPage: boolean;

  private chatsUpdatedSubscription: Subscription;
  private leftChatSubscription: Subscription;
  private joinChatSubscription: Subscription;
  private editedChatSubscription: Subscription;
  private activityStatusSubscription: Subscription;
  private searchedMessageSubscription: Subscription;

  @ViewChild(ChatScrollDirective, {static: true}) scrollDirective: ChatScrollDirective;
  @ViewChildren('message', {read: ElementRef}) messagesRefs: QueryList<ElementRef>;

  private searching: boolean;
  loading = false;
  sending = false;
  isOnline = true;

  @HostListener('window:offline', ['$event']) offlineHandler(event: Event): void {
    this.isOnline = false;
    console.log('offline mode');
  }
  @HostListener('window:online', ['$event']) onlineHandler(event: Event): void {
    this.isOnline = true;
    console.log('online mode');
  }

  constructor(private chatService: ChatService,
              private route: ActivatedRoute,
              private router: Router,
              private authService: AuthenticationService,
              private dialog: MatDialog,
              private chatHub: ChatHubService,
              private toastr: ToastrService,
              private userService: UserService) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserValue();
    this.initChat();
    this.createForms();
  }

  initChat(): void {
    this.route.data.subscribe((data) => {
      this.chat = data.chat;
      console.log(data.chat);

      if (this.chat.isPrivate) {
        const interlocutor = this.chatService.getChatInterlocutor(this.chat, this.authService.getCurrentUserValue());
        this.chat.name = interlocutor.userName;
        this.chat.pictureUrl = interlocutor.profilePictureUrl;
      }

      if (!this.chat.members.find((user) => user.id === this.currentUser.id)) {
        this.router.navigate(['/chats']).then(() => {
          this.toastr.error('You are not a member', 'Access Denied!');
        });
      }

      this.pageSize = Math.round(window.innerWidth / 100);
      this.messages = [];
      this.isLastPage = false;
      this.scrollDirective.reset();

      this.searchedMessageId = this.chatService.searchedMessageSubject.value?.id;
      this.searching = false;
      this.searchedMessageSubscription?.unsubscribe();

      if (!this.searchedMessageId) {
        this.loading = true;

        this._getMessages().subscribe(res => {
          this.loading = false;
          console.log('loaded');

          this.scrollDirective.prepareFor('up'); // this method stores the current scroll position
          this.messages = res.reverse();
          setTimeout(() => this.scrollDirective.restore()); // method to restore the scroll position

          this._subscribeToSearchedMessage();
        });
      } else {
        this._loadSearchedMessageScope(this.searchedMessageId);
        this.chatService.searchedMessageSubject.next(null);

        this._subscribeToSearchedMessage();
      }

      this.chatService.readMessages(this.chat.id, this.authService.getCurrentUserValue().id)
        .subscribe(res => {
          console.log('read');
          this.chatService.readMessagesSubject.next(this.chat.id);
        });
    });

    this.leftChatSubscription = this.chatService.leftChatSubject.subscribe(v => {
      console.log('notification was received');
      if (this.chat.id === v.chat.id) {
        if (this.currentUser.id !== v.user.id) {
          this.toastr.info(v.user.userName + ' has left', v.chat.name);
          const index = this.chat.members.findIndex((user) => user.id === v.user.id);
          if (index !== -1) {
            this.chat.members.splice(index, 1);
          }
        }
        this.userService.activityStatusSubject.next({isOnline: false, userId: v.user.id});
      }
    });

    this.joinChatSubscription = this.chatService.joinChatSubject.subscribe(v => {
      console.log('notification was received');
      if (this.currentUser.id !== v.user.id && this.chat.id === v.chat.id) {
        this.toastr.success(v.user.userName + ' has joined', 'New Member!');
        this.chat.members.unshift(v.user);
      }
      if (this.chat.isPrivate && this.chat.members.length > 2) {
        this.chat.isPrivate = false;
        this.chat.name = null;
        this.chat.pictureUrl = null;
      }
    });

    this.chatsUpdatedSubscription = this.chatService.chatsUpdatedSubject.subscribe(chat => {
      if (chat.id === this.chat.id && chat.lastMessage) {

        this.scrollDirective.prepareFor('up');
        this.messages.push(chat.lastMessage);
        setTimeout(() => this.scrollDirective.restore());

        if (chat.lastMessage.sender.id !== this.currentUser.id) {
          this.chatService.readMessage(chat.lastMessage.id, this.currentUser.id).subscribe(res => {
            console.log('message was read');
          });
        }
      }
    });

    this.editedChatSubscription = this.chatService.editedChatSubject.subscribe(chat => {
      this.chat = chat;
      this.toastr.info('Chat was updated', this.chat.name);
    });

    this.activityStatusSubscription = this.userService.activityStatusSubject.subscribe(v => {
      const user = this.chat.members.find(u => u.id === v.userId);
      if (user) {
        user.isOnline = v.isOnline;
      }
    });
  }

  private _subscribeToSearchedMessage(): void {
    this.searchedMessageSubscription = this.chatService.searchedMessageSubject.subscribe(message => {
      if (message && this.chat.id === message.chatId) {
        this._showMessage(message);
        this.chatService.searchedMessageSubject.next(null);
      }
    });
  }

  private _loadSearchedMessageScope(messageId: string): void {
    this.loading = true;
    this.chatService.getMessagesInScope(messageId, this.chat, this.messages.length, this.pageSize)
      .subscribe(res => {
        console.log('loaded ' + res.length + ' messages');
        this.messages = res.reverse().concat(this.messages);

        this.loading = false;
        this.searching = true; // not to load again on scroll up after this loading

        const index = this.messages.findIndex(m => m.id === messageId); // starts from loaded
        this._scrollToMessage(index);
    }, () => {
        this.loading = false;
      });
  }

  onSend(): void {
    if (this.messageFormGroup.valid) {
      const message = new Message();
      message.sender = this.currentUser;
      message.chatId = this.chat.id;
      message.text = this.messageFormGroup.get('message').value;

      if (!this.isOnline) {
        this.scrollDirective.prepareFor('up');
        this.messages.push(message);
        setTimeout(() => this.scrollDirective.restore());
      } else {
        this.sending = true;
        this.chatService.createMessage(message).subscribe(res => {
          this.chat.lastMessage = res;
          this.chatHub.notifyAboutChatsUpdate(this.chat);
          this.chatService.chatsUpdatedSubject.next(this.chat);

          this.sending = false;
        }, () => {
          this.scrollDirective.prepareFor('up');
          this.messages.push(message);
          setTimeout(() => this.scrollDirective.restore());

          this.sending = false;
          console.log('unsent - error from response');
        });
      }

      this.messageFormGroup.reset();
    }
  }

  createForms(): void {
    this.messageFormGroup = new FormGroup({message: new FormControl()});
    this.searchFormGroup = new FormGroup({text: new FormControl()});
  }

  onLeave(): void {
    this.chatService.removeChatMember(this.chat.id, this.currentUser.id).subscribe( res => {
      this.chatHub.notifyAboutLeaving(this.chat, this.currentUser);
      this.chatHub.leaveChat(this.chat.id);
      this.chatService.deletedChatSubject.next(this.chat);
    });
  }

  onAdd(): void {
    this.dialog.open(AddChatMemberDialogComponent, {data: this.chat});
  }

  onLoadMessages(): void {
    console.log('scrolled up');
    if (!this.searching && !this.isLastPage){
      this._getMessages()
        .subscribe(res => {
          this.scrollDirective.prepareFor('up');
          this.messages = res.reverse().concat(this.messages);
          setTimeout(() => this.scrollDirective.restore());

          console.log('loaded');
        });
    } else {
      this.searching = false;
    }
  }

  private _getMessages(): Observable<Message[]> {
    return this.chatService.getMessagesByText(this.chat, this.messages.length, this.pageSize)
      .pipe(tap((messages) => {
        if (messages.length < this.pageSize) {
          this.isLastPage = true;
        }
        return messages;
      }));
  }

  ngOnDestroy(): void {
    this.chatsUpdatedSubscription.unsubscribe();
    this.leftChatSubscription.unsubscribe();
    this.joinChatSubscription.unsubscribe();
    this.editedChatSubscription.unsubscribe();
    this.activityStatusSubscription.unsubscribe();
    this.searchedMessageSubscription.unsubscribe();
  }

  openMembersDialog(): void {
    this.dialog.open(UsersDialogComponent, {
      data: {users: this.chat.members, title: 'Members'}
    });
  }

  openEditChatDialog(): void {
    this.dialog.open(EditChatDialogComponent, {data: this.chat});
  }

  openSearchMessagesDialog(): void {
    const text = this.searchFormGroup.get('text').value;
    const dialogRef = this.dialog.open(SearchMessagesDialogComponent,
      {data: new MessageSearchOptions(text, this.currentUser.id, this.chat)});
    this.searchFormGroup.reset();

    dialogRef.afterClosed().subscribe((message: Message) => {
      if (message) {
        this._showMessage(message);
      }
    });
  }

  private _showMessage(message: Message): void {
    this.searchedMessageId = message.id;
    const index = this.messages.findIndex(m => m.id === message.id);
    console.log('index: ' + index);
    if (index === -1) {
      this._loadSearchedMessageScope(message.id);
     } else {
      this._scrollToMessage(index);
    }
  }

  private _scrollToMessage(index: number): void {
    if (index !== 0) {
      index--;
    }

    setTimeout(() => {
      const element = this.messagesRefs.toArray()[index].nativeElement;
      element.scrollIntoView();
      console.log(element);
    });
  }

  onResend(messageElement: Message, index: number): void {
    this.sending = true;
    this.chatService.createMessage(messageElement).subscribe(res => {
      this.messages.splice(index, 1);
      this.sending = false;

      this.chat.lastMessage = res;
      this.chatHub.notifyAboutChatsUpdate(this.chat);
      this.chatService.chatsUpdatedSubject.next(this.chat);
    }, () => {
      this.sending = false;
    });
  }
}
