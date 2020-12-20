import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CloudDirectory } from 'src/app/models/files-api-models';
import { FilesNewFolderDialogComponent } from '../files-new-folder-dialog/files-new-folder-dialog.component';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadingDialogComponent } from '../../global/loading-dialog/loading-dialog.component';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
  styleUrls: ['./files-upload.component.scss'],
})
export class FilesUploadComponent implements AfterViewInit {
  @Input() currentDirectory: CloudDirectory;
  @ViewChild('dropDiv') dropDiv: ElementRef<HTMLDivElement>;
  @ViewChild('file') input: ElementRef<HTMLInputElement>;

  showDragZone = false;
  setTimeoutID: number;
  currentlyUploading = false;

  constructor(
    private fsService: FileSystemService,
    private dialog: MatDialog,
    private translateService: TranslateService,
  ) {
    fsService.getCurrentFileUpload().subscribe((val) => {
      this.currentlyUploading = val != undefined;
    });
  }

  @HostListener('document:dragover', ['$event'])
  onDragOver(evt: DragEvent) {
    if (this.currentlyUploading) return;

    evt.preventDefault();
    evt.stopPropagation();
    this.showDragZone = true;
    window.clearTimeout(this.setTimeoutID);
    this.setTimeoutID = window.setTimeout(
      () => (this.showDragZone = false),
      250,
    );
  }

  @HostListener('document:drop', ['$event'])
  onDrop(evt: DragEvent) {
    if (this.currentlyUploading) return;

    evt.preventDefault();
    evt.stopPropagation();
    this.showDragZone = false;
    if (evt.dataTransfer.files.length === 1) {
      this.uploadSelectedFile(evt.dataTransfer.files[0]);
    }
  }

  uploadSelectedFile(file: File) {
    this.fsService.startFileUpload(file, this.currentDirectory);
  }

  ngAfterViewInit(): void {
    this.input.nativeElement.addEventListener('change', () => {
      if (this.input.nativeElement.files.length === 1) {
        this.uploadSelectedFile(this.input.nativeElement.files[0]);
      }
    });
  }

  uploadFile() {
    this.input.nativeElement.click();
  }

  createFileFromTemplate(templateID: string, extension: string) {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      width: '96px',
      height: '96px',
    });

    this.translateService
      .get('upload.new_file_name')
      .toPromise()
      .then((filename) => {
        filename = `${filename}.${extension}`;
        this.fsService
          .createFileFromTemplate(filename, this.currentDirectory, templateID)
          .toPromise()
          .finally(() => dialogRef.close());
      });
  }

  createFolder() {
    this.dialog.open(FilesNewFolderDialogComponent, {
      maxWidth: '400px',
      data: this.currentDirectory,
    });
  }
}
