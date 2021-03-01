import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';


export class VirtualScrollDataSource<T> extends DataSource<T | undefined> {

  public cachedItems = Array.from<T>({ length: 0 });
  protected dataStream = new BehaviorSubject<(T | undefined)[]>(this.cachedItems);
  protected subscription = new Subscription();
  protected lastPage = 0;
  public loading = true;


  constructor(protected pageSize: number) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<(T | undefined)[] | ReadonlyArray<T | undefined>> {
    this.subscription.add(collectionViewer.viewChange.subscribe(range => {
      const currentPage = this._getPageForIndex(range.end);
      if (currentPage > this.lastPage) {
        this.lastPage = currentPage;
        this._fetchPageData();
      }
    }));
    return this.dataStream;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.subscription.unsubscribe();
  }

  protected _fetchPageData(): void {
  }

  private _getPageForIndex(i: number): number {
    return Math.floor(i / this.pageSize);
  }
}
