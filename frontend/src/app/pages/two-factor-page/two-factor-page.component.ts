import {Component, HostListener, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
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
    tokenForm = this.fb.group({
        token: [null, Validators.required]
    });
    loading = false;
    private jwtHelper = new JwtHelperService();

    constructor(private fb: FormBuilder,
                private twoFactorServiceProvider: TwoFactorServiceProvider,
                private userServiceProvider: UserServiceProvider,
                private router: Router,
                private snackBar: MatSnackBar) {
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
        } else if (this.user.twoFactorEmail) {
            this.sendTokenByEmail();
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
                    this.twoFactorServiceProvider.default().verifyTokenByApp(this.user.secret,
                        this.tokenForm.get('token').value).toPromise().then(res => {
                        this.loading = false;
                        if (res) {
                            this.router.navigate(['/files']);
                        } else {
                            this.snackBar.open('Invalid token', null, {duration: 1500});
                        }
                    }).catch(err => {
                        this.loading = false;
                        this.snackBar.open(err.error.msg, null, {duration: 1500});
                    });
                    break;
                case 'sms':
                    this.twoFactorServiceProvider.default().verifyTokenBySms(this.user.phoneNumber,
                        this.tokenForm.get('token').value).toPromise().then(res => {
                        this.loading = false;
                        if (res) {
                            this.router.navigate(['/files']);
                        } else {
                            this.snackBar.open('Invalid token', null, {duration: 1500});
                        }
                    }).catch(err => {
                        this.loading = false;
                        this.snackBar.open(err.error.msg, null, {duration: 1500});
                    });
                    break;
                case 'email':
                    this.twoFactorServiceProvider.default().verifyTokenByEmail(this.user.email,
                        this.tokenForm.get('token').value).toPromise().then(res => {
                        this.loading = false;
                        if (res) {
                            this.router.navigate(['/files']);
                        } else {
                            this.snackBar.open('Invalid token', null, {duration: 1500});
                        }
                    }).catch(err => {
                        this.loading = false;
                        this.snackBar.open(err.error.msg, null, {duration: 1500});
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
        this.twoFactorServiceProvider.default().sendTokenBySms(this.user.phoneNumber).toPromise();
    }

    sendTokenByEmail(): void {
        this.twoFactorType = 'email';
        this.twoFactorServiceProvider.default().sendTokenByEmail(this.user.email).toPromise();
    }
}
