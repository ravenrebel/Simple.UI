import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

import {NewsService} from '../../../news-board/services/news.service';
import {NewsDataSource} from '../../models/news-data-source';


@Component({
  selector: 'app-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss']
})
export class PostsListComponent implements OnInit, OnDestroy {

  @Input() newsDataSource: NewsDataSource;
  private createdPostSubscription: Subscription;
  private removedPostSubscription: Subscription;
  private editedPostSubscription: Subscription;

  constructor(private newsService: NewsService,
              private router: Router) { }

  ngOnInit(): void {
    this.createdPostSubscription = this.newsService.createdPostSubject.subscribe(createdPost => {
      const currentUrl = this.router.routerState.snapshot.url;
      if (currentUrl === '/people/' + createdPost.creator.id || currentUrl === '/home') {
        this.newsDataSource.addPost(createdPost);
      }
      console.log('post added');
    });

    this.removedPostSubscription = this.newsService.removedPostSubject.subscribe(removedPost => {
      this.newsDataSource.removePost(removedPost);
      console.log('post removed');
    });

    this.editedPostSubscription = this.newsService.editedPostSubject.subscribe(editedPost => {
      this.newsDataSource.editPost(editedPost);
      console.log('post edited');
    });
  }

  ngOnDestroy(): void {
    this.createdPostSubscription.unsubscribe();
    this.removedPostSubscription.unsubscribe();
    this.editedPostSubscription.unsubscribe();
  }
}
