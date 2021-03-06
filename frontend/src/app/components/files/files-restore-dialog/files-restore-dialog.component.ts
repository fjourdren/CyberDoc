import { Component, HostListener, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';

@Component({
  selector: 'app-files-restore-dialog',
  templateUrl: './files-restore-dialog.component.html',
  styleUrls: ['./files-restore-dialog.component.css'],
})
export class FilesRestoreDialogComponent {
  loading = false;
  translateParams = { name: this.node.name };

  constructor(
    public dialogRef: MatDialogRef<FilesRestoreDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public node: CloudNode,
    private fsService: FileSystemService,
  ) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') {
      this.onRestoreBtnClicked();
    }
  }

  onRestoreBtnClicked() {
    this.dialogRef.disableClose = true;
    this.loading = true;
    this.fsService
      .restore(this.node)
      .toPromise()
      .then(() => {
        this.dialogRef.disableClose = false;
        this.loading = false;
        this.dialogRef.close(true);
      });
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }
}
