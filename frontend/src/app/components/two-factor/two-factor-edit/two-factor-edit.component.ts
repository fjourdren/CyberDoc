import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TwoFactorEditDialogComponent } from '../two-factor-edit-dialog/two-factor-edit-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TwoFactorGenerateRecoveryCodesDialogComponent } from '../two-factor-generate-recovery-codes-dialog/two-factor-generate-recovery-codes-dialog.component';
import { SecurityCheckDialogComponent } from '../../security-check-dialog/security-check-dialog.component';
import { UsersService } from 'src/app/services/users/users.service';
import { TwoFactorService } from '../../../services/twofactor/twofactor.service';

@Component({
  selector: 'app-two-factor-edit',
  templateUrl: './two-factor-edit.component.html',
  styleUrls: ['./two-factor-edit.component.css'],
})
export class TwoFactorEditComponent implements OnInit {
  @Output() twoFactorAppEvent = new EventEmitter<boolean>();
  @Output() twoFactorSmsEvent = new EventEmitter<boolean>();
  @Output() twoFactorEmailEvent = new EventEmitter<boolean>();
  twoFactorApp: boolean;
  twoFactorSms: boolean;
  twoFactorEmail: boolean;

  constructor(
    private usersService: UsersService,
    private twoFactorService: TwoFactorService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.usersService
      .refreshActiveUser()
      .toPromise()
      .then((refreshedUser) => {
        this.twoFactorApp = refreshedUser.twoFactorApp;
        this.twoFactorSms = refreshedUser.twoFactorSms;
        this.twoFactorEmail = refreshedUser.twoFactorEmail;
        this.twoFactorAppEvent.emit(this.twoFactorApp);
        this.twoFactorSmsEvent.emit(this.twoFactorSms);
        this.twoFactorEmailEvent.emit(this.twoFactorEmail);
      });
  }

  changeTwoFactorApp(event): void {
    if (this.twoFactorApp || this.twoFactorSms || this.twoFactorEmail) {
      if (this.twoFactorApp) {
        // Trying to disable 2FA APP
        event.source.checked = true;
        this.dialog
          .open(SecurityCheckDialogComponent, {
            maxWidth: '500px',
            data: {
              checkTwoFactor: true,
            },
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              this.usersService
                .disableTwoFactor('app', res.twoFactorToken)
                .toPromise()
                .then(() => {
                  event.source.checked = false;
                  this.snackBar.open('2FA by App disabled', null, {
                    duration: 2000,
                  });
                  this.refresh();
                });
              // }
            }
          });
      } else {
        // Trying to enable 2FA APP
        event.source.checked = false;
        this.dialog
          .open(SecurityCheckDialogComponent, {
            maxWidth: '500px',
            data: {
              checkTwoFactor: false,
            },
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
                width: '500px',
                data: {
                  twoFactorMode: 'app',
                },
              });

              refDialog
                .afterClosed()
                .toPromise()
                .then((res) => {
                  if (res) {
                    event.source.checked = true;
                    this.snackBar.open('2FA by App activated', null, {
                      duration: 2000,
                    });
                    this.refresh();
                  }
                });
            }
          });
      }
    } else {
      // Trying to enable 2FA APP(first time 2FA registering)
      event.source.checked = false;
      const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
        width: '500px',
        data: {
          twoFactorMode: 'app',
        },
      });

      refDialog
        .afterClosed()
        .toPromise()
        .then((res) => {
          if (res) {
            event.source.checked = true;
            this.refresh();
          }
        });
    }
  }

  changeTwoFactorSms(event): void {
    if (this.twoFactorSms || this.twoFactorApp || this.twoFactorEmail) {
      if (this.twoFactorSms) {
        // Trying to disable 2FA SMS
        event.source.checked = true;
        this.dialog
          .open(SecurityCheckDialogComponent, {
            maxWidth: '500px',
            data: {
              checkTwoFactor: true,
            },
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              this.usersService
                .disableTwoFactor('sms', res.twoFactorToken)
                .toPromise()
                .then(() => {
                  event.source.checked = false;
                  this.snackBar.open('2FA by SMS disabled', null, {
                    duration: 2000,
                  });
                  this.refresh();
                });
            }
          });
      } else {
        // Trying to enable 2FA SMS
        event.source.checked = false;
        this.dialog
          .open(SecurityCheckDialogComponent, {
            maxWidth: '500px',
            data: {
              checkTwoFactor: false,
            },
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
                width: '500px',
                data: {
                  twoFactorMode: 'sms',
                },
              });

              refDialog
                .afterClosed()
                .toPromise()
                .then((res) => {
                  if (res) {
                    event.source.checked = true;
                    this.snackBar.open('2FA by SMS activated', null, {
                      duration: 2000,
                    });
                    this.refresh();
                  }
                });
            }
          });
      }
    } else {
      // Trying to enable 2FA SMS (first time 2FA registering)
      event.source.checked = false;
      const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
        width: '500px',
        data: {
          twoFactorMode: 'sms',
        },
      });

      refDialog
        .afterClosed()
        .toPromise()
        .then((res) => {
          if (res) {
            event.source.checked = true;
            this.refresh();
          }
        });
    }
  }

  changeTwoFactorEmail(event): void {
    if (this.twoFactorApp || this.twoFactorSms || this.twoFactorEmail) {
      if (this.twoFactorEmail) {
        // Trying to disable 2FA Email
        event.source.checked = true;
        this.dialog
          .open(SecurityCheckDialogComponent, {
            maxWidth: '500px',
            data: {
              checkTwoFactor: true,
            },
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              this.usersService
                .disableTwoFactor('email', res.twoFactorToken)
                .toPromise()
                .then(() => {
                  event.source.checked = false;
                  this.snackBar.open('2FA by Email disabled', null, {
                    duration: 2000,
                  });
                  this.refresh();
                });
            }
          });
      } else {
        // Trying to enable 2FA APP
        event.source.checked = false;
        this.dialog
          .open(SecurityCheckDialogComponent, {
            maxWidth: '500px',
            data: {
              checkTwoFactor: false,
            },
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              this.twoFactorService
                .sendTokenByEmail()
                .toPromise()
                .catch((err) => {
                  this.snackBar.open(err.error.message, null, {
                    duration: 2500,
                  });
                });
              const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
                width: '500px',
                data: {
                  twoFactorMode: 'email',
                },
              });

              refDialog
                .afterClosed()
                .toPromise()
                .then((res) => {
                  if (res) {
                    event.source.checked = true;
                    this.snackBar.open('2FA by Email activated', null, {
                      duration: 2000,
                    });
                    this.refresh();
                  }
                });
            }
          });
      }
    } else {
      // Trying to enable 2FA Email (first time 2FA registering)
      event.source.checked = false;
      this.twoFactorService
        .sendTokenByEmail()
        .toPromise()
        .catch((err) => {
          this.snackBar.open(err.error.message, null, {
            duration: 2500,
          });
        });
      const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
        width: '500px',
        data: {
          twoFactorMode: 'email',
        },
      });

      refDialog
        .afterClosed()
        .toPromise()
        .then((res) => {
          if (res) {
            event.source.checked = true;
            this.refresh();
          }
        });
    }
  }

  generateRecoveryCodes(): void {
    this.dialog
      .open(SecurityCheckDialogComponent, {
        maxWidth: '500px',
        data: {
          checkTwoFactor: true,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.dialog.open(TwoFactorGenerateRecoveryCodesDialogComponent, {
            maxWidth: '500px',
            disableClose: true,
          });
        }
      });
  }
}
