import {Component} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {UserServiceProvider} from '../../services/users/user-service-provider'
import {User} from 'src/app/models/users-api-models';
import {MustMatch} from 'src/app/components/settings/settings-security/_helpers/must-match.validator';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {JwtHelperService} from '@auth0/angular-jwt';

const STRONG_PASSWORD_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$._\-!%*?&])[A-Za-z\d$@$!%*?&].{8,}/;
const JWT_COOKIE_NAME = 'access_token';

function passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const password = control.value;

        if (!password) return {passwordValidator: {invalid: true}};
        if (!password.match(/[A-Z]/g)) return {passwordValidator: {invalid: true}};
        if (!password.match(/[a-z]/g)) return {passwordValidator: {invalid: true}};
        if (!password.match(/[0-9]/g)) return {passwordValidator: {invalid: true}};
        if (!password.replace(/[0-9a-zA-Z ]/g, "").length) return {passwordValidator: {invalid: true}};

        return null;
    };
}

@Component({
    selector: 'app-register-page',
    templateUrl: './register-page.component.html',
    styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent {
    hidePassword = true;
    loading = false;
    emailAlreadyExistsError = false;
    genericError = false;
    registerForm: FormGroup;
    email: string;
    fileOwnerEmail: string;
    fileId: string;
    private jwtHelper = new JwtHelperService();
    private _cookieDomain: string;

    constructor(private fb: FormBuilder,
                private userServiceProvider: UserServiceProvider,
                private router: Router,
                private route: ActivatedRoute) {
        if (location.toString().indexOf('localhost') > -1) {
            this._cookieDomain = 'localhost';
        } else {
            this._cookieDomain = 'cyberdoc.fulgen.fr';
        }

        // Manage registering after file sharing
        this.route.queryParams.subscribe(params => {
            if(params['data']) {
                const cut: string[] = params['data'].split(";");

                this.email = cut[0];
                this.fileOwnerEmail = cut[1];
            }
        });

        this.registerForm = this.fb.group({
                firstName: [null, Validators.required],
                lastName: [null, Validators.required],
                email: [{value: this.email, disabled: !!this.email}, [Validators.required, Validators.email]],
                password: [null, [Validators.required, passwordValidator()]],
                repeat: [null, Validators.required],
                role: ['owner', Validators.required],
            },
            {
                validator: MustMatch('password', 'repeat')
            });
    }

    onSubmit(): void {
        if (this.registerForm.invalid || (this.email && this.registerForm.controls.email.value !== this.email)) {
            return;
        }

        this.loading = true;
        this.registerForm.disable();
        this.genericError = false;
        this.emailAlreadyExistsError = false;

        const user = {
            role: this.registerForm.controls.role.value,
            firstname: this.registerForm.controls.firstName.value,
            lastname: this.registerForm.controls.lastName.value,
            email: this.email || this.registerForm.controls.email.value,
        } as User;

        this.userServiceProvider.default().register(user, this.registerForm.controls.password.value, this.fileId).toPromise().then(() => {
            this.loading = false;
            this.router.navigate(['/two-factor-register']);
        }, error => {
            this.loading = false;
            this.registerForm.enable();

            if (error instanceof HttpErrorResponse && error.status === 409) {
                this.emailAlreadyExistsError = true;
            } else {
                this.genericError = true;
            }
        });
    }
}
