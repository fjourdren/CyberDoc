import { HttpErrorResponse } from '@angular/common/http';
import {  Component, ElementRef, HostListener, Inject, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';


@Component({
  selector: 'app-files-share-dialog',
  templateUrl: './files-share-dialog.component.html',
  styleUrls: ['./files-share-dialog.component.scss']
})


export class FilesShareDialogComponent {

  loading = false;
  //input = new FormControl('', [Validators.required, Validators.email]);
  //rank = new FormControl('state', [Validators.required]);

  // error handler:
  genericError = false;
  userError = false;
  alreadyLoggedError = false;

  registerForm = this.fb.group({
    input: [null, [Validators.required, Validators.email]],
    state: ['wo', Validators.required],
  });

  @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<FilesShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public node: CloudNode,
    private fsProvider: FileSystemProvider,
    private userServiceProvider: UserServiceProvider) {
      
  }
  
  @HostListener("keydown", ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      this.onShareBtnClicked();
    }
  }



  onShareBtnClicked() {
    if (this.registerForm.invalid) {
      return;
    }
    console.log(this.node.ownerName);
    if(this.registerForm.controls.input.value === this.node.ownerName){
      this.alreadyLoggedError = true;
    }
    
    this.loading = true;
    this.registerForm.disable();
    this.dialogRef.disableClose = true;
    //console.log(this.registerForm.controls.input.value);
    this.fsProvider.default().share(this.node._id, this.registerForm.controls.input.value).toPromise().then(() => {
      //console.log(this.registerForm.controls.input.value);
      this.loading = false;
      this.registerForm.enable();
      this.dialogRef.disableClose = false;
      this.dialogRef.close(true);
      
    }, (error) => {
      if (error instanceof HttpErrorResponse && error.status == 404) {
        this.userError = true;
      } else {
        this.genericError = true;
      }
      this.loading = false;
      this.registerForm.enable();
    })
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }

  ngOnInit() {
    //this.email = new FormControl('', [Validators.required, Validators.email]);
    this.registerForm = this.fb.group({
      input: ['', [Validators.required, Validators.email]],
      state: ['wo', Validators.required],
    });
  }

}
