import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TwoFactorEditDialogComponent } from '../two-factor-edit-dialog/two-factor-edit-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TwoFactorGenerateRecoveryCodesDialogComponent } from '../two-factor-generate-recovery-codes-dialog/two-factor-generate-recovery-codes-dialog.component';
import { SecurityCheckDialogComponent } from '../../security-check-dialog/security-check-dialog.component';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-two-factor-edit',
  templateUrl: './two-factor-edit.component.html',
  styleUrls: ['./two-factor-edit.component.css'],
})
export class TwoFactorEditComponent {
  @Output() twoFactorAppEvent = new EventEmitter<boolean>();
  @Output() twoFactorSmsEvent = new EventEmitter<boolean>();
  @Input() canGenerateRecoveryCodes: boolean;
  twoFactorApp: boolean;
  twoFactorSms: boolean;

  constructor(
    private usersService: UsersService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.refresh();
  }

  refresh(): void {
    this.twoFactorApp = this.usersService.getActiveUser().twoFactorApp;
    this.twoFactorSms = this.usersService.getActiveUser().twoFactorSms;
    this.twoFactorAppEvent.emit(this.twoFactorApp);
    this.twoFactorSmsEvent.emit(this.twoFactorSms);
  }

  changeTwoFactorApp(event): void {
    if (this.twoFactorApp || this.twoFactorSms) {
      if (this.twoFactorApp) {
        if (this.twoFactorSms) {
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
                if (res.xAuthTokenArray && res.xAuthTokenArray.length === 3) {
                  // password:appOrSms:2faToken
                  this.usersService
                    .updateTwoFactor(
                      !this.usersService.getActiveUser().twoFactorApp,
                      this.usersService.getActiveUser().twoFactorSms,
                      undefined,
                      undefined,
                      res.xAuthTokenArray,
                    )
                    .toPromise()
                    .then(() => {
                      this.usersService
                        .refreshActiveUser()
                        .toPromise()
                        .then(() => {
                          event.source.checked = false;
                          this.snackBar.open('2FA by App disabled', null, {
                            duration: 2000,
                          });
                          this.refresh();
                        });
                    });
                }
              }
            });
        } else {
          // Impossible to disable 2FA APP
          event.source.checked = true;
          this.snackBar.open(
            'You have to keep at least one 2FA option to use CyberDoc',
            null,
            { duration: 4000 },
          );
        }
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
          .subscribe((xAuthTokenArray) => {
            if (xAuthTokenArray && xAuthTokenArray.length === 1) {
              const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
                width: '500px',
                data: {
                  twoFactorMode: 'app',
                  xAuthTokenArray,
                },
              });

              refDialog
                .afterClosed()
                .toPromise()
                .then((res) => {
                  if (res) {
                    this.usersService
                      .refreshActiveUser()
                      .toPromise()
                      .then(() => {
                        event.source.checked = true;
                        this.snackBar.open('2FA by App activated', null, {
                          duration: 2000,
                        });
                        this.refresh();
                      });
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
          xAuthTokenArray: null,
        },
      });

      refDialog
        .afterClosed()
        .toPromise()
        .then((res) => {
          if (res) {
            event.source.checked = true;
          }
          this.refresh();
        });
    }
  }

  changeTwoFactorSms(event): void {
    if (this.twoFactorSms || this.twoFactorApp) {
      if (this.twoFactorSms) {
        if (this.twoFactorApp) {
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
                if (res.xAuthTokenArray && res.xAuthTokenArray.length === 3) {
                  // password:2faType:2faToken
                  this.usersService
                    .updateTwoFactor(
                      this.usersService.getActiveUser().twoFactorApp,
                      !this.usersService.getActiveUser().twoFactorSms,
                      undefined,
                      undefined,
                      res.xAuthTokenArray,
                    )
                    .toPromise()
                    .then(() => {
                      this.usersService
                        .refreshActiveUser()
                        .toPromise()
                        .then(() => {
                          event.source.checked = false;
                          this.snackBar.open('2FA by SMS disabled', null, {
                            duration: 2000,
                          });
                          this.refresh();
                        });
                    });
                }
              }
            });
        } else {
          // Impossible to disable 2FA SMS
          event.source.checked = true;
          this.snackBar.open(
            'You have to keep at least one 2FA option to use CyberDoc',
            null,
            { duration: 4000 },
          );
        }
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
          .subscribe((xAuthTokenArray) => {
            if (xAuthTokenArray && xAuthTokenArray.length === 1) {
              const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
                width: '500px',
                data: {
                  twoFactorMode: 'sms',
                  xAuthTokenArray,
                },
              });

              refDialog
                .afterClosed()
                .toPromise()
                .then((res) => {
                  if (res) {
                    this.usersService
                      .refreshActiveUser()
                      .toPromise()
                      .then(() => {
                        event.source.checked = true;
                        this.snackBar.open('2FA by SMS activated', null, {
                          duration: 2000,
                        });
                        this.refresh();
                      });
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
          xAuthTokenArray: null,
        },
      });

      refDialog
        .afterClosed()
        .toPromise()
        .then((res) => {
          if (res) {
            event.source.checked = true;
          }
          this.refresh();
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
          if (res.xAuthTokenArray && res.xAuthTokenArray.length === 3) {
            // [password:smsOrAppOrRecoveryCode:2faTokenOrRecoveryCode]
            if (
              res.xAuthTokenArray[1] === 'app' ||
              res.xAuthTokenArray[1] === 'sms'
            ) {
              this.dialog.open(TwoFactorGenerateRecoveryCodesDialogComponent, {
                maxWidth: '500px',
                disableClose: true,
                data: {
                  xAuthTokenArray: res.xAuthTokenArray,
                },
              });
            }
          }
        }
      });
  }
}
