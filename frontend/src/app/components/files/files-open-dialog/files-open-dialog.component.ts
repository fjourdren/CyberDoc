import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CloudFile } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';

@Component({
  selector: 'app-files-open-dialog',
  templateUrl: './files-open-dialog.component.html',
  styleUrls: ['./files-open-dialog.component.css']
})
export class FilesOpenDialogComponent {

  constructor(public dialogRef: MatDialogRef<FilesOpenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public file: CloudFile,
    private fsProvider: FileSystemProvider) {
      dialogRef.disableClose = true;
      this.fsProvider.default().getEtherpadURL(file).toPromise().then(url=>location.replace(url));
  }
}
