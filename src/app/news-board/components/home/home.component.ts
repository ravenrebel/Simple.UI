import {Component, OnInit} from '@angular/core';

import {AuthenticationService} from '../../../core/services/authentication.service';
import {NewsService} from '../../services/news.service';
import {NewsDataSource} from '../../../shared/models/news-data-source';
import {ToastrService} from 'ngx-toastr';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  dataSource: AllNewsDataSource;

  constructor(private newsService: NewsService,
              private authenticationService: AuthenticationService,
              private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.dataSource = new AllNewsDataSource(this.newsService, this.authenticationService, this.toastr);
  }
}

class AllNewsDataSource extends NewsDataSource {

  constructor(private newsService: NewsService,
              private authenticationService: AuthenticationService,
              private toastr: ToastrService) {
    super(7);
    this.fetchPageData();
  }

  public fetchPageData(): void {
    this.loading = true;
    this.newsService.getAllPosts(this.authenticationService.getCurrentUserValue().id,
      this.cachedNews.length, this.pageSize).subscribe(res => {
      if (res.length === 0 && this.firstPage) {
        this.toastr.info('Find new people to follow or create a post', 'No news :( ');
      } else {
        console.log('loaded');
        this.cachedNews = this.cachedNews.concat(res);
      }
      this.loading = false;
      this.firstPage = false;
    }, () => {
      this.loading = false;
    });
  }
}

