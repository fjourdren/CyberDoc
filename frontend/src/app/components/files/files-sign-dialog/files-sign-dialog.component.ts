import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Inject, NgZone } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CloudFile, RespondSign } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

const response: RespondSign[] = [
  {name: "Alexis LE GAL", email:"alegal@enssat.fr", date:"13/11/2020"},
  {name: "Clément FORGEARD", email:"cforgeard@enssat.fr", date:"15/11/2020"}
]

@Component({
  selector: 'app-files-sign-dialog',
  templateUrl: './files-sign-dialog.component.html',
  styleUrls: ['./files-sign-dialog.component.scss']
})
export class FilesSignDialogComponent {
  

  loading = false;
  displayedColumns: string[] = ['name', 'email', 'date'];
  dataSource = new MatTableDataSource([]);
  constructor(public dialogRef: MatDialogRef<FilesSignDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public file: CloudFile,
    private fsProvider: FileSystemProvider,
    private userServiceProvider: UserServiceProvider) {
      
    this.update();
    fsProvider.default().refreshNeeded().subscribe(() => {
      this.update();
    });
  }

  update() {
    //TO REMOVE ONCE LISTSIGNATORIES READY
    

    //TO TEST ONCE LISTSIGNATORIES READY
    this.fsProvider.default().listSignatories(this.file._id).toPromise().then(values=>{
      this.dataSource.data = values;
    }).catch(err => {
      this.dataSource.data = response;
  });
  }

  @HostListener("keydown", ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      this.onCloseBtnClicked();
    }
  }

  onInputKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      evt.stopPropagation();
      this.addSignatories();
    }
  }

  addSignatories() {

    this.dialog.open(FilesSignConfirmDialogComponent, {
      maxWidth: '400px',
      data: this.file
  });

  }

  onCloseBtnClicked() {
    this.dialogRef.close(false);
  }


}

@Component({
  selector: 'app-files-sign-confirm-dialog',
  templateUrl: './files-sign-confirm-dialog.component.html',
  styleUrls: ['./files-sign-dialog.component.scss']
})
export class FilesSignConfirmDialogComponent {

  loading = false;
  translateParams = {name: this.file.name};

  constructor(public dialogRef: MatDialogRef<FilesSignConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public file: CloudFile,
    private fsProvider: FileSystemProvider) {
  }

  @HostListener("keydown", ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      this.onSignBtnClicked();
    }
  }

  onSignBtnClicked(){
    this.dialogRef.disableClose = true;
    this.loading = true;
    this.fsProvider.default().sign(this.file._id).toPromise().then(()=>{
      this.dialogRef.disableClose = false;
      this.loading = false;
      this.dialogRef.close(true);
    }).catch(err => {
        console.log("Error, couldn't sign file : "+this.file._id);
        this.dialogRef.disableClose = false;
        this.loading = false;
        this.dialogRef.close(true);
      
    });
  }

  onCancelBtnClicked(){
    this.dialogRef.close(false);
  }

}
