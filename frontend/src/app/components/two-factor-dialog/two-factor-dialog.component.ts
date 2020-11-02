import {Component} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {JwtHelperService} from '@auth0/angular-jwt';
import {TwoFactorServiceProvider} from '../../services/twofactor/twofactor-service-provider';
import {UserServiceProvider} from '../../services/users/user-service-provider';
import {MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-two-factor-dialog',
    templateUrl: './two-factor-dialog.component.html',
    styleUrls: ['./two-factor-dialog.component.scss']
})

export class TwoFactorDialogComponent {
    user;
    twoFactorType;
    twoFactorForm = this.fb.group({
        token: [null, Validators.required]
    });
    private jwtHelper = new JwtHelperService();

    constructor(private fb: FormBuilder,
                private snackBar: MatSnackBar,
                private twoFactorServiceProvider: TwoFactorServiceProvider,
                private userServiceProvider: UserServiceProvider,
                public twoFactorDialog: MatDialogRef<TwoFactorDialogComponent>) {
        this.twoFactorForm = this.fb.group({
            token: [null, Validators.required]
        });

        this.user = this.jwtHelper.decodeToken(this.userServiceProvider.default().getJwtToken()).user;
        if (this.user.twoFactorApp) {
            this.twoFactorType = 'app';
        } else if (this.user.twoFactorSms) {
            this.sendTokenBySms();
        } else if (this.user.twoFactorEmail) {
            this.sendTokenByEmail();
        }
    }

    onSubmit(): void {
        if (this.twoFactorForm.invalid) {
            return;
        }
        switch (this.twoFactorType) {
            case 'app':
                this.twoFactorServiceProvider.default().verifyTokenByApp(this.user.secret,
                    this.twoFactorForm.get('token').value).toPromise().then(() => {
                    this.twoFactorDialog.close(true);
                }).catch(err => this.snackBar.open(err.error.msg, null, {duration: 2500}));
                break;
            case 'sms':
                this.twoFactorServiceProvider.default().verifyTokenBySms(this.user.phoneNumber,
                    this.twoFactorForm.get('token').value).toPromise().then(() => {
                    this.twoFactorDialog.close(true);
                }).catch(err => this.snackBar.open(err.error.msg, null, {duration: 2500}));
                break;
        }
    }

    sendTokenBySms(): void {
        this.twoFactorType = 'sms';
        this.twoFactorServiceProvider.default().sendTokenBySms(this.user.phoneNumber).toPromise()
            .catch(err => this.snackBar.open('SMS cannot be sent : ' + err.error.msg, null, {duration: 2500}));
    }
}
