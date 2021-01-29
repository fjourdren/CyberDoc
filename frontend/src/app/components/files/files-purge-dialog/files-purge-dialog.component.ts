import { Component, HostListener, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';

@Component({
  selector: 'app-files-purge-dialog',
  templateUrl: './files-purge-dialog.component.html',
  styleUrls: ['./files-purge-dialog.component.css'],
})
export class FilesPurgeDialogComponent {
  loading = false;
  

  constructor(
    public dialogRef: MatDialogRef<FilesPurgeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public node: CloudNode,
    private fsService: FileSystemService,
  ) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') {
      this.onPurgeBtnClicked();
    }
  }

  onPurgeBtnClicked() {
    this.dialogRef.disableClose = true;
    this.loading = true;
    this.fsService.purge().toPromise().then(() => {
        this.dialogRef.disableClose = false;
        this.loading = false;
        this.dialogRef.close(true);
      });
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }
}
