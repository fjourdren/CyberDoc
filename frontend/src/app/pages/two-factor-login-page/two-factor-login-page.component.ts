import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TwoFactorUseRecoveryCodeDialogComponent } from '../../components/two-factor/two-factor-use-recovery-code-dialog/two-factor-use-recovery-code-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TwoFactorService } from 'src/app/services/twofactor/twofactor.service';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-two-factor-login-page',
  templateUrl: './two-factor-login-page.component.html',
  styleUrls: ['./two-factor-login-page.component.scss'],
})
export class TwoFactorLoginPageComponent implements OnInit {
  user;
  twoFactorType;
  tokenForm = this.fb.group({
    token: [null, Validators.required],
  });
  loading = false;

  constructor(
    private fb: FormBuilder,
    private twoFactorService: TwoFactorService,
    private usersService: UsersService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  get f(): { [p: string]: AbstractControl } {
    return this.tokenForm.controls;
  }

  ngOnInit(): void {
    this.user = this.usersService.getActiveUser();
    if (this.user.twoFactorApp) {
      this.twoFactorType = 'app';
    } else if (this.user.twoFactorSms) {
      this.sendTokenBySms();
    }

    this.tokenForm = this.fb.group({
      token: [null, [Validators.required, Validators.pattern('[0-9]{6}')]],
    });
  }

  onSubmit(): void {
    if (this.tokenForm.invalid) {
      return;
    }
    this.loading = true;
    try {
      switch (this.twoFactorType) {
        case 'app':
          this.twoFactorService
            .verifyTokenByApp(undefined, this.tokenForm.get('token').value)
            .toPromise()
            .then(() => {
              this.loading = false;
              this.router.navigate(['/files']);
            })
            .catch((err) => {
              this.loading = false;
              this.snackBar.open(err.error.msg, null, { duration: 2500 });
            });
          break;
        case 'sms':
          this.twoFactorService
            .verifyTokenBySms(undefined, this.tokenForm.get('token').value)
            .toPromise()
            .then(() => {
              this.loading = false;
              this.router.navigate(['/files']);
            })
            .catch((err) => {
              this.loading = false;
              this.snackBar.open(err.error.msg, null, { duration: 2500 });
            });
          break;
      }
    } catch (err) {
      this.loading = false;
      this.snackBar.open(err.msg, null, { duration: 1500 });
    }
  }

  dialogTokenByApp(): void {
    this.twoFactorType = 'app';
  }

  sendTokenBySms(): void {
    this.twoFactorType = 'sms';
    this.twoFactorService
      .sendTokenBySms(undefined)
      .toPromise()
      .catch((err) =>
        this.snackBar.open('SMS cannot be sent : ' + err.error.msg, null, {
          duration: 2500,
        }),
      );
  }

  openDialogRecovery(): void {
    const refDialog = this.dialog.open(
      TwoFactorUseRecoveryCodeDialogComponent,
      {
        maxWidth: '450px',
      },
    );
    refDialog
      .afterClosed()
      .toPromise()
      .then((res) => {
        if (res && res.recoveryCodesLeft === false) {
          this.router.navigate(['/generateRecoveryCodes']);
        } else {
          this.router.navigate(['/files']);
        }
      });
  }
}
