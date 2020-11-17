import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { UserServiceProvider } from '../../services/users/user-service-provider'
import { MustMatch } from 'src/app/components/settings/settings-security/_helpers/must-match.validator';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from "@auth0/angular-jwt";
import { HttpErrorResponse } from '@angular/common/http';

function passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const password = control.value;

        if (!password) return { passwordValidator: { invalid: true } };
        if (!password.match(/[A-Z]/g)) return { passwordValidator: { invalid: true } };
        if (!password.match(/[a-z]/g)) return { passwordValidator: { invalid: true } };
        if (!password.match(/[0-9]/g)) return { passwordValidator: { invalid: true } };
        if (!password.replace(/[0-9a-zA-Z ]/g, "").length) return { passwordValidator: { invalid: true } };

        return null;
    };
}

@Component({
    selector: 'app-reset-password-page',
    templateUrl: './reset-password-page.component.html',
    styleUrls: ['./reset-password-page.component.scss']
})
export class ResetPasswordPageComponent implements AfterViewInit {
    private jwtHelper = new JwtHelperService();

    resetForm = this.fb.group({
        password: [null, [Validators.required, passwordValidator()]],
        repeat: [null, Validators.required],
        recoveryKey: [null, Validators.required]
    },
        {
            validator: MustMatch('password', 'repeat')
        });

    hidePassword = true;
    invalidRecoveryKeyError = false;
    loading = false;
    token: string;
    email: string;
    reset = false;
    recoverykeyFilename = "";
    recoverykeyFile: File;

    @ViewChild('file') input: ElementRef<HTMLInputElement>;

    constructor(private fb: FormBuilder,
        private userServiceProvider: UserServiceProvider,
        private router: Router,
        private route: ActivatedRoute) {

        this.route.queryParams.subscribe(params => {
            this.token = params['token'];
            const decodedToken = this.jwtHelper.decodeToken(this.token);
            console.warn(decodedToken);
            if (decodedToken && !this.jwtHelper.isTokenExpired(this.token) && decodedToken.email) {
                this.email = decodedToken.email;
            } else {
                this.router.navigate(["/"]);
            }
        });
    }

    ngAfterViewInit(): void {
        this.input.nativeElement.addEventListener("change", (e) => {
            if (this.input.nativeElement.files.length === 1) {
                this.recoverykeyFile = this.input.nativeElement.files[0];
                this.recoverykeyFilename = this.input.nativeElement.files[0].name;
            }
        })
    }

    onResetPasswordBtnClick() {
        if (!this.resetForm.valid) return;
        this.loading = true;
        this.invalidRecoveryKeyError = false;
        this.resetForm.disable();

        this.userServiceProvider.default().importRecoveryKey(this.email, this.resetForm.controls.password.value, this.recoverykeyFile, this.token).toPromise().then(()=>{
            this.userServiceProvider.default().resetPassword(this.token, this.email, this.resetForm.controls.password.value).toPromise().then(() => {
                this.loading = false;
                this.reset = true;
            });    
        }).catch(err => {
            if (err instanceof HttpErrorResponse && err.status === 400) {
                this.invalidRecoveryKeyError = true;
                this.loading = false;
                this.resetForm.enable();
            } else {
                throw err;
            }
        });
    }
}