import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CloudFile } from 'src/app/models/files-api-models';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';
import { UsersService } from '../../../services/users/users.service';

@Component({
  selector: 'app-files-convert-to-etherpad-dialog',
  templateUrl: './files-convert-to-etherpad-dialog.component.html',
  styleUrls: ['./files-convert-to-etherpad-dialog.component.css'],
})
export class FilesConvertToEtherpadDialogComponent {
  loading = false;
  canConvert = false;

  constructor(
    public dialogRef: MatDialogRef<FilesConvertToEtherpadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public file: CloudFile,
    private fsService: FileSystemService,
    private usersService: UsersService,
  ) {
    this.canConvert = file.owner_id === usersService.getActiveUser()._id;
  }

  onConvertBtnClicked() {
    this.dialogRef.disableClose = true;
    this.loading = true;
    this.fsService
      .convertFileToEtherpadFormat(this.file)
      .toPromise()
      .then((url) => {
        location.replace(url);
      });
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }
}
