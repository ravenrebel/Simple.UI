import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import {ChatService} from '../../services/chat.service';
import {VirtualScrollDataSource} from '../../../shared/models/virtual-scroll-data-source';
import {Message} from '../../models/message';
import {MessageSearchOptions} from '../../models/message-search-options';
import {Observable} from 'rxjs';


@Component({
  selector: 'app-search-messages-dialog',
  templateUrl: './search-messages-dialog.component.html',
  styleUrls: ['./search-messages-dialog.component.scss']
})
export class SearchMessagesDialogComponent implements OnInit {
  dataSource: SearchResultDataSource;
  currentUserId: string;

  constructor(@Inject(MAT_DIALOG_DATA) public searchOptions: MessageSearchOptions,
              private chatService: ChatService) { }

  ngOnInit(): void {
    this.currentUserId = this.searchOptions.userId;
    this.dataSource = new SearchResultDataSource(this.chatService, this.searchOptions);
  }

}

class SearchResultDataSource extends VirtualScrollDataSource<Message> {
  constructor(private chatService: ChatService,
              private searchOptions: MessageSearchOptions) {
    super(Math.round(window.innerWidth / 100));
    this._fetchPageData();
  }

  protected _fetchPageData(): void {
    this.loading = true;
    let messages: Observable<Message[]>;
    if (this.searchOptions.chat) {
      messages = this.chatService.getMessagesByText(this.searchOptions.chat,
        this.cachedItems.length,
        this.pageSize,
        this.searchOptions.text
      );
    } else {
      messages = this.chatService.getMessagesByTextGlobal(this.searchOptions.userId,
        this.cachedItems.length,
        this.pageSize,
        this.searchOptions.text
      );
    }
    messages.subscribe(res => {
      this.cachedItems = this.cachedItems.concat(res);
      this.dataStream.next(this.cachedItems);
      this.loading = false;
    });
  }
}

