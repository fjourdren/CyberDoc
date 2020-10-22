import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {UserServiceProvider} from '../../services/users/user-service-provider';
import {TwoFactorServiceProvider} from '../../services/twofactor/twofactor-service-provider';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-two-factor-page',
    templateUrl: './two-factor-page.component.html',
    styleUrls: ['./two-factor-page.component.scss']
})

export class TwoFactorPageComponent implements OnInit {
    user;
    twoFactorType;
    twoFactorForm = this.fb.group({
        token: [null, Validators.required]
    });
    private jwtHelper = new JwtHelperService();

    constructor(private fb: FormBuilder,
                private twoFactorServiceProvider: TwoFactorServiceProvider,
                private userServiceProvider: UserServiceProvider,
                private router: Router,
                private snackBar: MatSnackBar) {
    }

    ngOnInit(): void {
        this.user = this.jwtHelper.decodeToken(this.userServiceProvider.default().getJwtToken()).user;
        if (this.user.twoFactorApp) {
            this.twoFactorType = 'app';
        } else if (this.user.twoFactorSms) {
            this.sendTokenBySms();
        } else if (this.user.twoFactorEmail) {
            this.sendTokenByEmail();
        }

        this.twoFactorForm = this.fb.group({
            token: [null, Validators.required]
        });
    }

    onSubmit(): void {
        if (this.twoFactorForm.invalid) {
            return;
        }
        switch (this.twoFactorType) {
            case 'app':
                this.twoFactorServiceProvider.default().verifyTokenByApp(this.user.secret,
                    this.twoFactorForm.get('token').value).toPromise().then(res => {
                    if (res) {
                        this.router.navigate(['/files']);
                    } else {
                        this.snackBar.open('Wrong token', null, {duration: 1500});
                    }
                });
                break;
            case 'sms':
                this.twoFactorServiceProvider.default().verifyTokenBySms(this.user.phoneNumber,
                    this.twoFactorForm.get('token').value).toPromise().then(res => {
                    if (res) {
                        this.router.navigate(['/files']);
                    } else {
                        this.snackBar.open('Wrong token', null, {duration: 1500});
                    }
                });
                break;
            case 'email':
                this.twoFactorServiceProvider.default().verifyTokenByEmail(this.user.email,
                    this.twoFactorForm.get('token').value).toPromise().then(res => {
                    if (res) {
                        this.router.navigate(['/files']);
                    } else {
                        this.snackBar.open('Wrong token', null, {duration: 1500});
                    }
                });
                break;
        }
    }

    sendTokenBySms(): void {
        this.twoFactorType = 'sms';
        this.twoFactorServiceProvider.default().sendTokenBySms(this.user.phoneNumber).toPromise().then(res => {
            this.snackBar.open(res, null, {duration: 1500});
        });
    }

    sendTokenByEmail(): void {
        this.twoFactorType = 'email';
        this.twoFactorServiceProvider.default().sendTokenByEmail(this.user.email).toPromise().then(res => {
            this.snackBar.open(res, null, {duration: 1500});
        });
    }
}
