
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { UserServiceProvider } from '../../services/users/user-service-provider'
import { User } from 'src/app/models/users-api-models';
import { MustMatch } from 'src/app/components/settings/settings-security/_helpers/must-match.validator';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
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
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.scss']
})
export class ResetPasswordPageComponent {
  resetForm = this.fb.group({
    password: [null, [Validators.required, passwordValidator()]],
    repeat: [null, Validators.required],
  },
    {
      validator: MustMatch('password', 'repeat')
    });

  hidePassword = true;
  loading = false;

  emailAlreadyExistsError = false;
  genericError = false;

  //gestion token :
  token = "empty";

  reset = false;

  wrongCredentialError = false;

  constructor(private fb: FormBuilder,
    private userServiceProvider: UserServiceProvider,
    private router: Router,
    private route: ActivatedRoute) {
      this.route.queryParams.subscribe(params => {
        this.token = params['token'];
      });
     }

  onSubmit() {
    if (this.resetForm.invalid || this.token.includes("empty")) {
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

      if (error instanceof HttpErrorResponse && error.status == 409) {
        this.emailAlreadyExistsError = true;
      } else {
        this.genericError = true;
      }
    });
  }


}
