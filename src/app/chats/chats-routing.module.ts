import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ChatsComponent} from './components/chats/chats.component';
import {ChatMessagesComponent} from './components/chat-messages/chat-messages.component';
import {ChatResolver} from './resolvers/chat.resolver';

const routes: Routes = [
  {
    path: '',
    component: ChatsComponent,
    children: [
      {
      path: ':id',
      component: ChatMessagesComponent,
      resolve: {
        chat: ChatResolver,
      }
    }]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
// @ts-ignore
export class ChatsRoutingModule { }
