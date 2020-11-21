import { HttpErrorResponse } from '@angular/common/http';
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
      this.fsProvider.default().getEtherpadURL(file).toPromise().then(url=>location.replace(url)).catch(err=>{
        //FIXME 21-11-2020 cforgeard HOTFIX because I don't know how to create a Etherpad PAD via a POST request
        if (err instanceof HttpErrorResponse && err.status === 501) {
          alert("Sorry but actually you can't open files larger than 10KO...");
          dialogRef.disableClose = false;
          dialogRef.close();
        } else {
          throw err;
        }
      })
  }
}
