import { NgModule } from '@angular/core';

import { ChatsComponent } from './components/chats/chats.component';
import { MessageComponent } from './components/message/message.component';
import { ChatsListComponent } from './components/chats-list/chats-list.component';
import {SharedModule} from '../shared/shared.module';
import {ChatsRoutingModule} from './chats-routing.module';
import { ChatMessagesComponent } from './components/chat-messages/chat-messages.component';
import { ChatInfoComponent } from './components/chat-info/chat-info.component';
import { AddChatMemberDialogComponent } from './components/add-chat-member-dialog/add-chat-member-dialog.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatChipsModule} from '@angular/material/chips';
import {ChatScrollDirective} from './directives/chat-scroll.directive';
import { EditChatDialogComponent } from './components/edit-chat-dialog/edit-chat-dialog.component';
import { SearchMessagesDialogComponent } from './components/search-messages-dialog/search-messages-dialog.component';
import { CreateChatDialogComponent } from './components/create-chat-dialog/create-chat-dialog.component';
import { SelectMembersComponent } from './components/select-members/select-members.component';


@NgModule({
  declarations: [
    ChatsComponent,
    MessageComponent,
    ChatsListComponent,
    ChatMessagesComponent,
    ChatInfoComponent,
    AddChatMemberDialogComponent,
    ChatScrollDirective,
    EditChatDialogComponent,
    SearchMessagesDialogComponent,
    CreateChatDialogComponent,
    SelectMembersComponent,
  ],
    imports: [
        SharedModule,
        ChatsRoutingModule,
        MatAutocompleteModule,
        MatChipsModule
    ]
})
// @ts-ignore
export class ChatsModule { }
