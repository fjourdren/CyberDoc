import {Component} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {UserServiceProvider} from '../../services/users/user-service-provider'
import {User} from 'src/app/models/users-api-models';
import {MustMatch} from 'src/app/components/settings/settings-security/_helpers/must-match.validator';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {JwtHelperService} from '@auth0/angular-jwt';

const STRONG_PASSWORD_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$._\-!%*?&])[A-Za-z\d$@$!%*?&].{8,}/;
const JWT_COOKIE_NAME = 'access_token';

@Component({
    selector: 'app-register-page',
    templateUrl: './register-page.component.html',
    styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent {
    registerForm = this.fb.group({
            firstName: [null, Validators.required],
            lastName: [null, Validators.required],
            email: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required, Validators.pattern(STRONG_PASSWORD_REGEX)]],
            repeat: [null, Validators.required],
            role: ['owner', Validators.required],
        },
        {
            validator: MustMatch('password', 'repeat')
        });
    hidePassword = true;
    loading = false;
    emailAlreadyExistsError = false;
    genericError = false;
    private _jwtHelper = new JwtHelperService();
    private _cookieDomain: string;

    constructor(private fb: FormBuilder,
                private userServiceProvider: UserServiceProvider,
                private router: Router,
                private cookieService: CookieService) {
        if (location.toString().indexOf('localhost') > -1) {
            this._cookieDomain = 'localhost';
        } else {
            this._cookieDomain = 'cyberdoc.fulgen.fr';
        }
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
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
            email: this.registerForm.controls.email.value,
        } as User;

        this.userServiceProvider.default().register(user, this.registerForm.controls.password.value).toPromise().then(() => {
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
