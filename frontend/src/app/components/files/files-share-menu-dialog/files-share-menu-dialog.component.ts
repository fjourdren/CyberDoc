import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CloudFile } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

@Component({
  selector: 'app-files-share-menu-dialog',
  templateUrl: './files-share-menu-dialog.component.html',
  styleUrls: ['./files-share-menu-dialog.component.scss'],
})
export class FilesShareMenuDialogComponent {
  loading = false;
  newShareForm = this.fb.group({
    email: [null, [Validators.email, Validators.required]],
  });
  shareModeForm = this.fb.group({ shareMode: [null] });
  shareAccessFormControl = new FormControl('readonly');
  displayedColumns: string[] = ['email-and-name', 'delete'];
  dataSource = new MatTableDataSource([]);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FilesShareMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public file: CloudFile,
    private fsProvider: FileSystemProvider,
    private userServiceProvider: UserServiceProvider,
  ) {
    this.update();
    fsProvider
      .default()
      .refreshNeeded()
      .subscribe(() => {
        this.update();
      });
  }

  update(): void {
    this._setIsLoading(true);
    Promise.all([
      this.fsProvider.default().get(this.file._id).toPromise(),
      this.fsProvider.default().getSharedWith(this.file._id).toPromise(),
      this.fsProvider.default().getSharedWithPending(this.file._id).toPromise(),
    ]).then((values) => {
      this._setIsLoading(false);
      if (!values[0].isDirectory) {
        this.shareModeForm
          .get('shareMode')
          .setValue((values[0] as CloudFile).shareMode);
        this.dataSource.data = values[1];
        values[2].forEach((email) => {
          this.dataSource.data = this.dataSource.data.concat({
            email,
            name: 'Pending email...',
          });
        });
      }
    });
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent): void {
    if (evt.key === 'Enter') {
      this.onCloseBtnClicked();
    }
  }

  onInputKeyDown(evt: KeyboardEvent): void {
    if (evt.key === 'Enter') {
      evt.stopPropagation();
      this.addEntry();
    }
  }

  deleteEntry(email: string): void {
    this._setIsLoading(true);
    this.fsProvider
      .default()
      .deleteShare(this.file._id, email)
      .toPromise()
      .then(() => {
        this._setIsLoading(false);
      });
  }

  addEntry(): void {
    const formField = this.newShareForm.get('email');

    if (
      !this.newShareForm.get('email').valid ||
      !formField.value ||
      formField.value.trim() === ''
    ) {
      formField.setErrors({ invalid: true });
      return;
    } else {
      formField.setErrors(null);
    }

    // If the email entered is the email of the current user, ignore it
    if (
      this.userServiceProvider.default().getActiveUser().email ===
      formField.value.toLowerCase()
    ) {
      return;
    }

    // If the user associated with the email entered already have access, ignore it
    for (const item of this.dataSource.data) {
      if (item.email === formField.value.toLowerCase()) {
        return;
      }
    }

    this._setIsLoading(true);
    this.fsProvider
      .default()
      .share(this.file._id, formField.value.toLowerCase())
      .toPromise()
      .then(() => {
        this._setIsLoading(false);
        this.newShareForm.get('email').setValue('');
      })
      .catch((err) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this._setIsLoading(false);
          formField.setErrors({ invalid: true });
        }
      });
  }

  onCloseBtnClicked(): void {
    this.dialogRef.close(false);
  }

  updateFileShareMode(): void {
    const shareMode = this.shareModeForm.get('shareMode').value;
    this._setIsLoading(true);
    this.fsProvider
      .default()
      .setShareMode(this.file, shareMode)
      .toPromise()
      .then(() => {
        this._setIsLoading(false);
      });
  }

  private _setIsLoading(value: boolean): void {
    this.loading = value;
    this.dialogRef.disableClose = value;
    if (value) {
      this.newShareForm.disable();
      this.shareModeForm.disable();
    } else {
      this.newShareForm.enable();
      this.shareModeForm.enable();
    }
  }
}
