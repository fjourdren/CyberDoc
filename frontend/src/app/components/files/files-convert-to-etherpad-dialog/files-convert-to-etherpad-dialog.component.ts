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
  canConvert = false;

  constructor(
    public dialogRef: MatDialogRef<FilesConvertToEtherpadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public file: CloudFile,
    private fsService: FileSystemService,
  ) {
    this.canConvert = file.access === 'owner';
  }

  onConvertBtnClicked() {
    this.dialogRef.disableClose = true;
    this.loading = true;
    this.fsService
      .convertFileToEtherpadFormat(this.file)
      .toPromise()
      .then((url) => {
        this.dialogRef.close(true);
      });
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }
}
