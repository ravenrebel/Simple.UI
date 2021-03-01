import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Post} from '../../models/post';
import {environment} from '../../../../environments/environment';
import {Attachment} from '../../models/attachment';
import {
  NgxGalleryAnimation,
  NgxGalleryComponent,
  NgxGalleryImage,
  NgxGalleryImageSize,
  NgxGalleryLayout,
  NgxGalleryOptions
} from '@kolkov/ngx-gallery';
import {NewsService} from '../../../news-board/services/news.service';


@Component({
  selector: 'app-post-content',
  templateUrl: './post-content.component.html',
  styleUrls: ['./post-content.component.scss']
})
export class PostContentComponent implements OnInit {
  @Input() post: Post;
  baseUrl = environment.fileStorageUrl;
  fileAttachments: Attachment[];

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  @ViewChild('ngxGalleryComponent', {static: true}) gallery: NgxGalleryComponent;

  constructor(private newsService: NewsService) {
  }

  ngOnInit(): void {
    this.galleryOptions = [
      {
        width: '100%',
        height: '60vh',
        thumbnailsColumns: 6,
        layout: NgxGalleryLayout.ThumbnailsBottom,
        imageAnimation: NgxGalleryAnimation.Fade,
        previewZoom: true,
        previewRotate: true,
        previewKeyboardNavigation: true,
        thumbnailsArrowsAutoHide: true,
        previewFullscreen: true,
        previewCloseOnClick: true,
        previewCloseOnEsc: true,
        previewDownload: true,
        previewBullets: true,
        arrowPrevIcon: 'fa fa-arrow-left',
        arrowNextIcon: 'fa fa-arrow-right',
        imageSize: NgxGalleryImageSize.Contain,
        lazyLoading: true,
        thumbnailsPercent: 20,
        imagePercent: 80,
        thumbnailMargin: 2,
        thumbnailsMargin: 2,
      },
      // max-width 800
      {
        breakpoint: 800,
        height: '600px',
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false
      }
    ];

    this._sortAttachments(this.post.attachments);
    this.newsService.editedPostSubject.subscribe( post => {
      if (post.id === this.post.id) {
        this._sortAttachments(post.attachments);
      }
    });

  }

  private _sortAttachments(attachments: Attachment[]): void {
    this.galleryImages = [];
    this.fileAttachments = [];

    for (const attachment of attachments) {

      if (attachment.fileUrl.toLowerCase().match('\.(jpeg|jpg|gif|png|svg|tiff|webp)$') !== null) {
        const url = this.baseUrl + attachment.fileUrl;
        this.galleryImages.push({small: url, big: url, medium: url, description: attachment.fileName});
      } else {
        this.fileAttachments.push(attachment);
      }
    }

    this.galleryOptions.forEach(o => {
      o.thumbnails = this.galleryImages.length !== 1;
      o.previewArrows = this.galleryImages.length !== 1;
      o.imageArrowsAutoHide = this.galleryImages.length !== 1;
      o.imageArrows = this.galleryImages.length !== 1;
    });
  }
}

