import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';

import {ChatService} from '../services/chat.service';
import {Chat} from '../models/chat';


@Injectable({ providedIn: 'root' })// @ts-ignore
export class ChatResolver implements Resolve<Chat> {

  constructor(private chatService: ChatService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    const id = route.paramMap.get('id');
    return this.chatService.getChatById(id);
  }
}
