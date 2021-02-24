import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MustMatch } from './_helpers/must-match.validator';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { UsersService } from 'src/app/services/users/users.service';
import { SecurityCheckDialogComponent } from '../../security-check-dialog/security-check-dialog.component';
import { environment } from '../../../../environments/environment';

function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const password = control.value;

    if (!password) {
      return { passwordValidator: { invalid: true } };
    }
    if (!password.match(/[A-Z]/g)) {
      return { passwordValidator: { invalid: true } };
    }
    if (!password.match(/[a-z]/g)) {
      return { passwordValidator: { invalid: true } };
    }
    if (!password.match(/[0-9]/g)) {
      return { passwordValidator: { invalid: true } };
    }
    if (!password.replace(/[0-9a-zA-Z ]/g, '').length) {
      return { passwordValidator: { invalid: true } };
    }

    return null;
  };
}

@Component({
  selector: 'app-settings-security',
  templateUrl: './settings-security.component.html',
  styleUrls: ['./settings-security.component.scss'],
})
export class SettingsSecurityComponent {
  loading = false;
  readonly twoFactorAuthDisabled = environment.disableTwoFactorAuthAndEmail;

  // Password
  passwordForm: FormGroup;
  hidePassword1 = true;
  hidePassword2 = true;
  hidePassword3 = true;

  // Passwords
  isTextFieldType: boolean;
  isTextFieldType2: boolean;

  // Table
  displayedColumns: string[] = ['name', 'browser', 'OS', 'rename'];
  dataSource = new MatTableDataSource([]);

  constructor(
    private usersService: UsersService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.passwordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, passwordValidator()]],
        newPasswordConfirmation: [
          '',
          [Validators.required, passwordValidator()],
        ],
      },
      {
        validator: MustMatch('newPassword', 'newPasswordConfirmation'),
      },
    );
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.loading = true;
    this.dialog
      .open(SecurityCheckDialogComponent, {
        maxWidth: '500px',
        data: {
          checkTwoFactor: true,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res.currentPassword) {
          this.usersService
            .updatePassword(
              res.currentPassword,
              this.passwordForm.get('newPassword').value,
            )
            .toPromise()
            .then(() => {
              this.snackBar.dismiss();
              this.snackBar.open('Password updated', null, {
                duration: 1500,
              });
              this.passwordForm.reset();
            });
        }
        this.loading = false;
      });
  }

  public checkError = (controlName: string, errorName: string) => {
    return this.passwordForm.controls[controlName].hasError(errorName);
  };

  exportData(): void {
    const anchor = document.createElement('a');
    anchor.download = `${
      this.usersService.getActiveUser().email
    }-personal-data.txt`;
    anchor.href = this.usersService.getDataExportURL();
    anchor.click();
    anchor.remove();
  }
}
