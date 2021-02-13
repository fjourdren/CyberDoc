import { Component, HostListener, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CloudFile } from 'src/app/models/files-api-models';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-files-sign-dialog',
  templateUrl: './files-sign-dialog.component.html',
  styleUrls: ['./files-sign-dialog.component.scss'],
})
export class FilesSignDialogComponent {
  loading = false;
  hasAlreadySign = false;
  isEmpty = false;
  displayedColumns = ['user_email', 'created_at'];
  dataSource = new MatTableDataSource([]);

  constructor(
    public dialogRef: MatDialogRef<FilesSignDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public file: CloudFile,
    private fsService: FileSystemService,
    private usersService: UsersService,
  ) {
    this.update();
    fsService.refreshNeeded().subscribe(() => {
      this.update();
    });
  }

  update() {
    this.fsService
      .listSignatories(this.file._id)
      .toPromise()
      .then((values) => {
        this.dataSource.data = values;
        for (const element of values) {
          element.created_at = new Date(element.created_at).toLocaleString();
          if (element.user_email === this.usersService.getActiveUser().email) {
            this.hasAlreadySign = true;
          }
        }
      });
  }

  addSignature() {
    this.dialog.open(FilesSignConfirmDialogComponent, {
      width: '400px',
      data: this.file,
    });
  }

  onCloseBtnClicked() {
    this.dialogRef.close(false);
  }
}

@Component({
  selector: 'app-files-sign-confirm-dialog',
  templateUrl: './files-sign-confirm-dialog.component.html',
  styleUrls: ['./files-sign-dialog.component.scss'],
})
export class FilesSignConfirmDialogComponent {
  loading = false;
  translateParams = { name: this.file.name };

  constructor(
    public dialogRef: MatDialogRef<FilesSignConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public file: CloudFile,
    private fsService: FileSystemService,
  ) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') {
      this.onSignBtnClicked();
    }
  }

  onSignBtnClicked() {
    this.dialogRef.disableClose = true;
    this.loading = true;
    this.fsService
      .sign(this.file._id)
      .toPromise()
      .then(() => {
        this.dialogRef.disableClose = false;
        this.loading = false;
        this.dialogRef.close(true);
      });
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }
}
