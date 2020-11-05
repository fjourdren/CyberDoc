import {Component} from '@angular/core';
import {AbstractControl, FormBuilder, ValidatorFn, Validators} from '@angular/forms';
import {UserServiceProvider} from '../../services/users/user-service-provider';
import {MustMatch} from 'src/app/components/settings/settings-security/_helpers/must-match.validator';
import {ActivatedRoute, Router} from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';

function passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const password = control.value;

        if (!password) { return {passwordValidator: {invalid: true}}; }
        if (!password.match(/[A-Z]/g)) { return {passwordValidator: {invalid: true}}; }
        if (!password.match(/[a-z]/g)) { return {passwordValidator: {invalid: true}}; }
        if (!password.match(/[0-9]/g)) { return {passwordValidator: {invalid: true}}; }
        if (!password.replace(/[0-9a-zA-Z ]/g, '').length) { return {passwordValidator: {invalid: true}}; }

        return null;
    };
}

@Component({
    selector: 'app-reset-password-page',
    templateUrl: './reset-password-page.component.html',
    styleUrls: ['./reset-password-page.component.scss']
})
export class ResetPasswordPageComponent {
    private jwtHelper = new JwtHelperService();
    private readonly baseUrl: string;
    private readonly cookieDomain: string;

    resetForm = this.fb.group({
            password: [null, [Validators.required, passwordValidator()]],
            repeat: [null, Validators.required],
        },
        {
            validator: MustMatch('password', 'repeat')
        });

    hidePassword = true;
    loading = false;
    genericError = false;

    // gestion token :
    token = 'empty';
    email: string;

    reset = false;

    wrongCredentialError = false;

    constructor(private fb: FormBuilder,
                private userServiceProvider: UserServiceProvider,
                private router: Router,
                private route: ActivatedRoute) {
        this.route.queryParams.subscribe(params => {
            this.token = params.token;
            this.email = this.jwtHelper.decodeToken(this.token).email;
        });
    }

    onSubmit(): void {
        if (this.resetForm.invalid || this.token.includes('empty')) {
            this.router.navigate(['/login']);
            return;
        }
        console.log(this.token);

        this.loading = true;
        this.resetForm.disable();
        this.genericError = false;

        this.userServiceProvider.default().resetPassword(this.token, this.resetForm.controls.password.value).toPromise().then(value => {
            this.loading = false;
            this.reset = true;
        }, error => {
            this.loading = false;
            this.resetForm.enable();
            this.genericError = true;
        });
    }
}
