import {  Component, ElementRef, HostListener, Inject, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';


@Component({
  selector: 'app-files-share-dialog',
  templateUrl: './files-share-dialog.component.html',
  styleUrls: ['./files-share-dialog.component.css']
})


export class FilesShareDialogComponent {

  loading = false;
  //input = new FormControl('', [Validators.required, Validators.email]);
  //rank = new FormControl('state', [Validators.required]);

  registerForm = this.fb.group({
    input: [null, [Validators.required, Validators.email]],
    state: ['wo', Validators.required],
  });

  @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<FilesShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public node: CloudNode,
    private fsProvider: FileSystemProvider) {
      
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
    
    this.loading = true;
    this.registerForm.disable();
    this.dialogRef.disableClose = true;
    this.fsProvider.default().share(this.node.id, this.registerForm.controls.input.value, this.registerForm.controls.state.value).toPromise().then(() => {
      this.loading = false;
      this.registerForm.enable();
      this.dialogRef.disableClose = false;
      this.dialogRef.close(true);
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
