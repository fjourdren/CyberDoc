import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CloudFile } from 'src/app/models/files-api-models';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';

@Component({
  selector: 'app-files-convert-to-etherpad-dialog',
  templateUrl: './files-convert-to-etherpad-dialog.component.html',
  styleUrls: ['./files-convert-to-etherpad-dialog.component.css'],
})
export class FilesConvertToEtherpadDialogComponent {
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<FilesConvertToEtherpadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public file: CloudFile,
    private fsService: FileSystemService,
  ) {}

  onConvertBtnClicked() {
    this.dialogRef.disableClose = true;
    this.loading = true;
    this.fsService
      .convertFileToEtherpadFormat(this.file)
      .toPromise()
      .then((url) => {
        location.replace(url);
      });
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }
}
