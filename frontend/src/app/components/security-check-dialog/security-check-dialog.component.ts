import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TwoFactorCheckDialogComponent } from '../two-factor/two-factor-check-dialog/two-factor-check-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TwoFactorGenerateRecoveryCodesDialogComponent } from '../two-factor/two-factor-generate-recovery-codes-dialog/two-factor-generate-recovery-codes-dialog.component';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-delete-account-password-dialog',
  templateUrl: 'security-check-dialog.component.html',
  styleUrls: ['./security-check-dialog.component.scss'],
})
export class SecurityCheckDialogComponent implements OnInit {
  passwordForm: FormGroup;
  hidePassword = true;

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private usersService: UsersService,
    private dialog: MatDialog,
    public verifyPasswordDialog: MatDialogRef<SecurityCheckDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent): void {
    if (evt.key === 'Escape') {
      this.onCancel();
    }
  }

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      password: [null, Validators.required],
    });
  }

  onCancel(): void {
    this.verifyPasswordDialog.close(false);
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }
    const password: string = this.passwordForm.get('password').value;
    this.usersService
      .validatePassword(password)
      .toPromise()
      .then((isPasswordVerified) => {
        if (isPasswordVerified) {
          if (this.data.checkTwoFactor) {
            const currentUser = this.usersService.getActiveUser();
            if (
              currentUser.twoFactorApp ||
              currentUser.twoFactorSms ||
              currentUser.twoFactorEmail
            ) {
              this.dialog
                .open(TwoFactorCheckDialogComponent, {
                  maxWidth: '500px',
                })
                .afterClosed()
                .subscribe((res) => {
                  if (res) {
                    if (res.hasRecoveryCodesLeft === false) {
                      this.dialog.open(
                        TwoFactorGenerateRecoveryCodesDialogComponent,
                        {
                          maxWidth: '500px',
                          disableClose: true,
                        },
                      );
                    }
                    this.verifyPasswordDialog.close({
                      currentPassword: password,
                    });
                  } else {
                    this.verifyPasswordDialog.close(false);
                  }
                });
            } else {
              this.verifyPasswordDialog.close({
                currentPassword: password,
              });
            }
          } else {
            this.verifyPasswordDialog.close({
              currentPassword: password,
            });
          }
        }
      })
      .catch((err) => {
        this.snackBar.open(err.error.msg, null, { duration: 2500 });
      });
  }
}
