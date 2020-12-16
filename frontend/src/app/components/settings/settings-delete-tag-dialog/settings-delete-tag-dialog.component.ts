import { Component, HostListener, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileTag } from 'src/app/models/files-api-models';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-settings-delete-tag-dialog',
  templateUrl: './settings-delete-tag-dialog.component.html',
  styleUrls: ['./settings-delete-tag-dialog.component.css'],
})
export class SettingsDeleteTagDialogComponent {
  loading = false;
  translateParams = { name: this.tag.name };

  constructor(
    public dialogRef: MatDialogRef<SettingsDeleteTagDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public tag: FileTag,
    private usersService: UsersService,
  ) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') {
      this.onDeleteBtnClicked();
    }
  }

  onDeleteBtnClicked() {
    this.dialogRef.disableClose = true;
    this.loading = true;
    this.usersService
      .removeTag(this.tag)
      .toPromise()
      .then(() => {
        this.usersService
          .refreshActiveUser()
          .toPromise()
          .then(() => {
            this.dialogRef.disableClose = false;
            this.loading = false;
            this.dialogRef.close(true);
          });
      });
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }
}
