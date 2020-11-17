import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Inject, NgZone } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { element } from 'protractor';
import { stringify } from 'querystring';
import { CloudFile, RespondSign, RespondAnswerSign } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

const response: RespondAnswerSign[] = [
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""},
  {user_email:"alegal@enssat.fr", created_at:"13/11/2020", diggest:""},
  {user_email:"cforgeard@enssat.fr", created_at:"15/11/2020", diggest:""}

]

@Component({
  selector: 'app-files-sign-dialog',
  templateUrl: './files-sign-dialog.component.html',
  styleUrls: ['./files-sign-dialog.component.scss']
})
export class FilesSignDialogComponent {
  

  loading = false;
  hasAlreadySign = false;
  isEmpty = false;
  genericError = false;
  dateSign: string;
  hourSign: string
  displayedColumns: string[] = ['user_email', 'created_at'];
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
    //TO TEST ONCE LISTSIGNATORIES READY
    this.fsProvider.default().listSignatories(this.file._id).toPromise().then(values=>{
      
      if(values.length === 0){
        this.isEmpty = true;
      }
      values.forEach(element=>{        
        this.dateSign = element.created_at.slice(0,10);
        this.hourSign = element.created_at.slice(11,19);
        element.created_at= this.dateSign+" / "+this.hourSign;
        if(element.user_email===this.userServiceProvider.default().getActiveUser().email){
          this.hasAlreadySign = true;
        }
      })
      this.dataSource.data = values;
     
    }).catch(err => {
      this.genericError = true;
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
        
        this.dialogRef.disableClose = false;
        this.loading = false;
        this.dialogRef.close(true);
      
    });
  }

  onCancelBtnClicked(){
    this.dialogRef.close(false);
  }

}
