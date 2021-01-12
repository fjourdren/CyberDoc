import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CloudFile } from '../../../models/files-api-models';
import { FileSystemService } from '../../../services/filesystems/file-system.service';

@Component({
  selector: 'app-files-open-in-etherpad-dialog',
  templateUrl: './files-open-in-etherpad-dialog.component.html',
  styleUrls: ['./files-open-in-etherpad-dialog.component.css'],
})
export class FilesOpenInEtherpadDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<FilesOpenInEtherpadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public file: CloudFile,
    private fsService: FileSystemService,
  ) {
    dialogRef.disableClose = true;
    this.fsService
      .getEtherpadURL(file)
      .toPromise()
      .then((url) => location.replace(url));
  }
}
