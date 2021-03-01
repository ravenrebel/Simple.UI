import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {FilePickerComponent, FilePreviewModel, ValidationError} from 'ngx-awesome-uploader';
import {CustomFilePickerAdapter} from '../../helpers/custom-file-picker.adapter';
import {HttpClient} from '@angular/common/http';

const mbSize = 1048576;

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements OnInit {

  constructor(private http: HttpClient) { }

  get files(): FilePreviewModel[] {
    return this.filePicker.files;
  }
  totalSize = 0;
  uploadedNewFiles: FilePreviewModel[] = [];
  adapter = new  CustomFilePickerAdapter(this.http);
  @ViewChild('filePickerComponent', {static: true}) private filePicker: FilePickerComponent;
  filePickerError: ValidationError;
  @ViewChildren('error', {read: ElementRef}) errorsRefs: QueryList<ElementRef>;

  @Input() totalMaxSize = 25;
  @Input() uploadType = 'multi';
  @Input() accept: string;
  @Input() fileExtensions: string[];
  @Input() fileMaxSize: number;
  @Input() cropRounded: boolean;
  @Output() upload: EventEmitter<FilePreviewModel> = new EventEmitter<FilePreviewModel>();
  @Output() removed: EventEmitter<FilePreviewModel> = new EventEmitter<FilePreviewModel>();

  private static _getRoundedCanvas(sourceCanvas): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    canvas.width = width;
    canvas.height = height;
    context.imageSmoothingEnabled = true;
    context.drawImage(sourceCanvas, 0, 0, width, height);
    context.globalCompositeOperation = 'destination-in';
    context.beginPath();
    context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true);
    context.fill();
    return canvas;
  }

  @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event): void {
    console.log(this.uploadedNewFiles);
    this.clearUploadedFiles();
  }

  ngOnInit(): void {
    this.filePicker.cropperOptions = {
      dragMode: 'crop',
      aspectRatio: this.cropRounded ? 1 : null,
      viewMode: 1,
      background: false,
      autoCrop: true,
      movable: true,
      zoomable: true,
      scalable: true,
      autoCropArea: 0.8
    };

    this.filePicker.onCropSubmit = () => {
      if (this.cropRounded) {
        FileUploaderComponent._getRoundedCanvas(this.filePicker.cropper
          .getCroppedCanvas())
          .toBlob(this.filePicker.blobFallBack.bind(this.filePicker), 'image/png');
      }
      else {
        this.filePicker.cropper
          .getCroppedCanvas()
          .toBlob(this.filePicker.blobFallBack.bind(this.filePicker), 'image/png');
      }
    };
  }

  onUploadSuccess(filePreviewModel: FilePreviewModel): void {
    this.totalSize += filePreviewModel.file.size / mbSize;

    if (filePreviewModel.file.size) {
      this.uploadedNewFiles.push(filePreviewModel);
      this.upload.emit(filePreviewModel);
    }
  }

  onRemoveSuccess(filePreviewModel: FilePreviewModel): void {
    if (this.filePicker.files.reduce((total, fileModel) =>
      total + fileModel.file.size / mbSize, 0) === this.totalSize) {
      this.totalSize -= filePreviewModel.file.size / mbSize;
    }

    if (filePreviewModel.file.size) {
      const fileIndex = this.uploadedNewFiles.findIndex(f => f.fileId === filePreviewModel.fileId);
      if (fileIndex > -1) {
        this.uploadedNewFiles.splice(fileIndex, 1);
      }
    }

    this.removed.emit(filePreviewModel);
    this.filePickerError = null;
  }

  onValidationError(error: ValidationError): void {
    console.log(`error: ${error.error}`);
    this.filePickerError = error;

    setTimeout(() => {
      console.log(this.errorsRefs);
      const element = this.errorsRefs.toArray()[0].nativeElement;
      element.scrollIntoView();
    });
  }

  onFileAdded(filePreviewModel: FilePreviewModel): void {
    console.log(filePreviewModel);
    this.filePickerError = null;
  }

  addFile(filePreviewModel: FilePreviewModel): void {
    this.filePicker.files.push(filePreviewModel);
  }

  clearUploadedFiles(): void {
    if (this.uploadedNewFiles.length) {
      this.adapter.removeFiles(this.uploadedNewFiles).subscribe();
    }
  }
}
