import { Component, HostListener, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileSystemProviderService } from 'src/app/services/filesystems/file-system-provider';

@Component({
  selector: 'app-files-delete-dialog',
  templateUrl: './files-delete-dialog.component.html',
  styleUrls: ['./files-delete-dialog.component.css']
})
export class FilesDeleteDialogComponent {

  loading = false;
  translateParams = {filename: this.data.name};

  constructor(public dialogRef: MatDialogRef<FilesDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CloudNode,
    private fsProvider: FileSystemProviderService) {
  }

  @HostListener("keydown", ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      this.onDeleteBtnClicked();
    }
  }

  onDeleteBtnClicked(){
    this.dialogRef.disableClose = true;
    this.loading = true;
    this.fsProvider.default().delete(this.data.id).toPromise().then(()=>{
      this.dialogRef.disableClose = false;
      this.loading = false;
      this.dialogRef.close(true);
    })
  }

  onCancelBtnClicked(){
    this.dialogRef.close(false);
  }

}
