import {Post} from './post';


export class NewsDataSource {

  private removedPostsCount = 0;
  private readonly postsCountLimit: number;
  public loading = true;
  public cachedNews: Post[] = [];
  protected firstPage = true;

  constructor(public pageSize: number) {
    this.postsCountLimit = this.pageSize / 2;
  }

  public fetchPageData(): void {
  }

  public addPost(post: Post): void{
    this.cachedNews.unshift(post);
  }

  public removePost(removedPost: Post): void{
    const index = this.cachedNews.findIndex(p => p.id === removedPost.id);
    if (index > -1) {
      if (this.removedPostsCount > this.postsCountLimit) {
        this.fetchPageData();
        this.removedPostsCount = 0;
      }
      this.cachedNews.splice(index, 1);
      this.removedPostsCount++;
    }
  }

  editPost(editedPost: Post): void {
    const index = this.cachedNews.findIndex(p => p.id === editedPost.id);
    if (index > -1) {
      this.cachedNews[index] = editedPost;
    }
  }
}
