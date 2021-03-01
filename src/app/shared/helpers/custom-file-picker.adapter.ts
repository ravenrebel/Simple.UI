import {FilePickerAdapter, FilePreviewModel} from 'ngx-awesome-uploader';
import {HttpClient, HttpEvent, HttpEventType, HttpRequest} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {environment} from '../../../environments/environment';
import * as uuid from 'uuid';

export class CustomFilePickerAdapter extends FilePickerAdapter {
  baseUrl = environment.apiUrl + 'uploads/';

  constructor(private http: HttpClient) {
    super();
  }

  public uploadFile(fileItem: FilePreviewModel): Observable<number | string> {
    if (!fileItem.fileId) {
      const form = new FormData();
      form.append('file', fileItem.file, uuid.v4() + fileItem.fileName);

      const req = new HttpRequest(
        'POST',
        this.baseUrl,
        form,
        {reportProgress: true}
      );

      return this.http.request(req)
        .pipe(
          map( (res: HttpEvent<any>) => {
            console.log(res);
            if (res.type === HttpEventType.Response) {
              console.log(res.body);
              return res.body.id.toString();
            } else if (res.type ===  HttpEventType.UploadProgress) {
              // Compute and show the % done:
              return Math.round((100 * res.loaded) / res.total);
            }
          })
        );
    } else {
      return of(fileItem.fileId);
    }
  }

  public removeFile(fileItem: FilePreviewModel): Observable<any> {
    console.log(fileItem.fileId);
    console.log(fileItem.file.size);
    if (fileItem.fileId && fileItem.file.size) {
      console.log('delete');
      return this.http.delete(this.baseUrl + fileItem.fileId);
    } else {
      return of(() => {});
    }
  }

  public removeFiles(fileItems: FilePreviewModel[]): Observable<any> {
    return this.http.post(this.baseUrl + 'delete-list', fileItems.map(f => f.fileId));
  }

  public getFile(fileName): Observable<any> {
    return this.http.get(this.baseUrl + fileName);
  }
}
