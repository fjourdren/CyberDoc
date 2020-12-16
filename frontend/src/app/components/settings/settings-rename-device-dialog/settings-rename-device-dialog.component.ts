import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  ViewChild,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsersService } from 'src/app/services/users/users.service';

export interface DialogDevicesData {
  name: string;
}

@Component({
  selector: 'app-settings-rename-device-dialog',
  templateUrl: './settings-rename-device-dialog.component.html',
  styleUrls: ['./settings-rename-device-dialog.component.scss'],
})
export class SettingsRenameDeviceDialogComponent {
  nameAlreadyChoose = false;
  loading = false;
  input = new FormControl('', [
    Validators.required,
    this.noWhitespaceValidator,
  ]);
  @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;

  constructor(
    public dialogRef: MatDialogRef<SettingsRenameDeviceDialogComponent>,
    private usersService: UsersService,
    @Inject(MAT_DIALOG_DATA) public data: DialogDevicesData,
  ) {
    this.input.setValue(this.data.name);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') {
      this.onRenameBtnClicked();
    }
  }

  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  onRenameBtnClicked() {
    if (!this.input.value) {
      return;
    }
    if (this.input.value === this.data.name) {
      this.dialogRef.close(true);
      return;
    }

    this.loading = true;
    this.input.disable();
    this.dialogRef.disableClose = true;
    this.usersService
      .renameUserDevice(this.data.name, this.input.value)
      .toPromise()
      .then(
        () => {
          this.loading = false;
          this.input.enable();
          this.dialogRef.disableClose = false;
          this.dialogRef.close(true);
        },
        () => {
          this.loading = false;
          this.nameAlreadyChoose = true;
          this.input.enable();
        },
      );
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }
}
