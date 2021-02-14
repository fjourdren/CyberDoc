import { Component, HostListener } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TwoFactorUseRecoveryCodeDialogComponent } from '../../components/two-factor/two-factor-use-recovery-code-dialog/two-factor-use-recovery-code-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TwoFactorService } from 'src/app/services/twofactor/twofactor.service';
import { UsersService } from 'src/app/services/users/users.service';
import { timer } from 'rxjs';

@Component({
  selector: 'app-two-factor-login-page',
  templateUrl: './two-factor-login-page.component.html',
  styleUrls: ['./two-factor-login-page.component.scss'],
})
export class TwoFactorLoginPageComponent {
  user;
  twoFactorType;

  twoFactorForm = this.fb.group({
    token: [null, [Validators.required, Validators.pattern('^[0-9]{6}$')]],
  });
  loading = false;
  subscribeTimerSms: number;
  subscribeTimerEmail: number;
  private timeLeft: number;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private twoFactorService: TwoFactorService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private router: Router,
  ) {
    this.user = this.usersService.getActiveUser();
    if (this.user.twoFactorApp) {
      this.twoFactorType = 'app';
    } else if (this.user.twoFactorEmail) {
      this.sendTokenByEmail();
    } else if (this.user.twoFactorSms) {
      this.sendTokenBySms();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent): void {
    if (evt.key === 'Enter') {
      this.onSubmit();
    }
  }

  onSubmit(): void {
    if (this.twoFactorForm.invalid) {
      return;
    }
    this.loading = true;
    try {
      switch (this.twoFactorType) {
        case 'app':
          this.twoFactorService
            .verifyToken('app', this.twoFactorForm.get('token').value)
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
            .verifyToken('sms', this.twoFactorForm.get('token').value)
            .then(() => {
              this.loading = false;
              this.router.navigate(['/files']);
            })
            .catch((err) => {
              this.loading = false;
              this.snackBar.open(err.error.msg, null, { duration: 2500 });
            });
          break;
        case 'email':
          this.twoFactorService
            .verifyToken('email', this.twoFactorForm.get('token').value)
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

  sendTokenBySms(): void {
    this.twoFactorType = 'sms';
    this.twoFactorService
      .sendTokenBySms()
      .toPromise()
      .then(() => {
        this.timeLeft = 60; // TODO : variable globale
        const source = timer(0, 1000);
        source.subscribe((val) => {
          this.subscribeTimerSms = this.timeLeft - val;
        });
      })
      .catch((err) =>
        this.snackBar.open('SMS cannot be sent : ' + err.error.msg, null, {
          duration: 2500,
        }),
      );
  }

  sendTokenByEmail(): void {
    this.twoFactorType = 'email';
    this.twoFactorService
      .sendTokenByEmail()
      .toPromise()
      .then(() => {
        this.timeLeft = 60; // TODO : variable globale
        const source = timer(0, 1000);
        source.subscribe((val) => {
          this.subscribeTimerEmail = this.timeLeft - val;
        });
      })
      .catch((err) =>
        this.snackBar.open('Email cannot be sent : ' + err.error.msg, null, {
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
        if (res) {
          if (!res.hasRecoveryCodesLeft) {
            this.usersService
              .refreshActiveUser()
              .toPromise()
              .then(() => {
                this.router.navigate(['/generateRecoveryCodes']);
              });
          } else {
            this.usersService
              .refreshActiveUser()
              .toPromise()
              .then(() => {
                this.router.navigate(['/files']);
              });
          }
        }
      });
  }
}
