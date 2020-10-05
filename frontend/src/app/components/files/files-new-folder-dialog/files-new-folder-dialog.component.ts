import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CloudDirectory } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';

@Component({
  selector: 'app-files-new-folder-dialog',
  templateUrl: './files-new-folder-dialog.component.html',
  styleUrls: ['./files-new-folder-dialog.component.css']
})
export class FilesNewFolderDialogComponent {

  loading = false;
  input = new FormControl('', [Validators.required]);

  constructor(public dialogRef: MatDialogRef<FilesNewFolderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentFolder: CloudDirectory,
    private fsProvider: FileSystemProvider) {
  }

  @HostListener("keydown", ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      this.onCreateBtnClicked();
    }
  }

  onCreateBtnClicked() {
    if (!this.input.value) { return; }

    this.loading = true;
    this.input.disable();
    this.dialogRef.disableClose = true;
    this.fsProvider.default().createDirectory(this.input.value, this.parentFolder.id).toPromise().then(() => {
      this.loading = false;
      this.input.enable();
      this.dialogRef.disableClose = false;
      this.dialogRef.close(true);
    })
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }
}
