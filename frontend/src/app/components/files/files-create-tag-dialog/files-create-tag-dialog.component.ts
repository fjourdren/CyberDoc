import { Component, HostListener, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CloudNode, FileTag } from 'src/app/models/files-api-models';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

@Component({
  selector: 'app-files-create-tag-dialog',
  templateUrl: './files-create-tag-dialog.component.html',
  styleUrls: ['./files-create-tag-dialog.component.css']
})
export class FilesCreateTagDialogComponent {

  loading = false;
  name = new FormControl('', [Validators.required]);
  color = new FormControl('#000000', [Validators.required]);

  constructor(public dialogRef: MatDialogRef<FilesCreateTagDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public node: CloudNode,
    private userServiceProvider: UserServiceProvider) {
  }

  @HostListener("keydown", ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      this.onAddBtnClicked();
    }
  }

  onAddBtnClicked() {
    if (!this.name.valid) { return; }
    if (!this.color.valid) { return; }

    this.dialogRef.disableClose = true;
    this.loading = true;
    const newTag = new FileTag();
    newTag.hexColor = this.color.value;
    newTag.name = this.name.value;

    this.userServiceProvider.default().addTag(newTag).toPromise().then(() => {
      this.userServiceProvider.default().refreshActiveUser().toPromise().then(()=>{
        this.dialogRef.disableClose = false;
        this.loading = false;
        this.dialogRef.close(true);  
      })
    })
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }


}
