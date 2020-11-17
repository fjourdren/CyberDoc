import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {UserServiceProvider} from '../../services/users/user-service-provider';
import {TwoFactorServiceProvider} from '../../services/twofactor/twofactor-service-provider';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TwoFactorUseRecoveryCodeDialogComponent} from '../../components/two-factor/two-factor-use-recovery-code-dialog/two-factor-use-recovery-code-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
    selector: 'app-two-factor-login-page',
    templateUrl: './two-factor-login-page.component.html',
    styleUrls: ['./two-factor-login-page.component.scss']
})

export class TwoFactorLoginPageComponent implements OnInit {
    user;
    twoFactorType;
    tokenForm = this.fb.group({
        token: [null, Validators.required]
    });
    loading = false;
    private jwtHelper = new JwtHelperService();

    constructor(private fb: FormBuilder,
                private twoFactorServiceProvider: TwoFactorServiceProvider,
                private userServiceProvider: UserServiceProvider,
                private router: Router,
                private snackBar: MatSnackBar,
                private dialog: MatDialog) {
    }

    get f(): { [p: string]: AbstractControl } {
        return this.tokenForm.controls;
    }

    ngOnInit(): void {
        this.user = this.jwtHelper.decodeToken(this.userServiceProvider.default().getJwtToken()).user;
        if (this.user.twoFactorApp) {
            this.twoFactorType = 'app';
        } else if (this.user.twoFactorSms) {
            this.sendTokenBySms();
        }

        this.tokenForm = this.fb.group({
            token: [null, [Validators.required, Validators.pattern('[0-9]{6}')]]
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
                    this.twoFactorServiceProvider.default().verifyTokenByApp(
                        undefined, this.tokenForm.get('token').value).toPromise().then(() => {
                        this.loading = false;
                        this.router.navigate(['/files']);
                    }).catch(err => {
                        this.loading = false;
                        this.snackBar.open(err.error.msg, null, {duration: 2500});
                    });
                    break;
                case 'sms':
                    this.twoFactorServiceProvider.default().verifyTokenBySms(
                        undefined, this.tokenForm.get('token').value).toPromise().then(() => {
                        this.loading = false;
                        this.router.navigate(['/files']);
                    }).catch(err => {
                        this.loading = false;
                        this.snackBar.open(err.error.msg, null, {duration: 2500});
                    });
                    break;
            }
        } catch (err) {
            this.loading = false;
            this.snackBar.open(err.msg, null, {duration: 1500});
        }
    }

    dialogTokenByApp(): void {
        this.twoFactorType = 'app';
    }

    sendTokenBySms(): void {
        this.twoFactorType = 'sms';
        this.twoFactorServiceProvider.default().sendTokenBySms(undefined).toPromise()
            .catch(err => this.snackBar.open('SMS cannot be sent : ' + err.error.msg, null, {duration: 2500}));
    }

    openDialogRecovery(): void {
        const refDialog = this.dialog.open(TwoFactorUseRecoveryCodeDialogComponent, {
            maxWidth: '500px'
        });
        refDialog.afterClosed().toPromise().then(res => {
            if (res.result) {
                if (!res.recoveryCodesLeft) {
                    this.router.navigate(['/generateRecoveryCodes']);
                } else {
                    this.router.navigate(['/files']);
                }
            }
        });
    }
}
