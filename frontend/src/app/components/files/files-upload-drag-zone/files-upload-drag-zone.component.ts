import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CloudDirectory } from 'src/app/models/files-api-models';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';
import { UsersService } from '../../../services/users/users.service';
import { FilesNoEnoughStorageDialogComponent } from '../files-no-enough-storage-dialog/files-no-enough-storage-dialog.component';

@Component({
  selector: 'app-files-upload-drag-zone',
  templateUrl: './files-upload-drag-zone.component.html',
  styleUrls: ['./files-upload-drag-zone.component.css'],
})
export class FilesUploadDragZoneComponent {
  @Input() currentDirectory: CloudDirectory;
  @ViewChild('dropDiv') dropDiv: ElementRef<HTMLDivElement>;

  showDragZone = false;
  setTimeoutID: number;

  constructor(
    private usersService: UsersService,
    private fsService: FileSystemService,
    private dialog: MatDialog,
  ) {}

  @HostListener('document:dragover', ['$event'])
  onDragOver(evt: DragEvent) {
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
    evt.preventDefault();
    evt.stopPropagation();
    this.showDragZone = false;
    if (evt.dataTransfer.files.length === 1) {
      this.uploadSelectedFile(evt.dataTransfer.files[0]);
    }
  }

  uploadSelectedFile(file: File) {
    const user = this.usersService.getActiveUser();
    if (user.usedSpace + file.size > user.availableSpace) {
      this.dialog.open(FilesNoEnoughStorageDialogComponent, {
        width: '400px',
      });
    } else {
      this.fsService.startFileUpload(file, this.currentDirectory);
    }
  }
}
