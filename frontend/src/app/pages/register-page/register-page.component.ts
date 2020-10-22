import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { UserServiceProvider } from '../../services/users/user-service-provider'
import { User } from 'src/app/models/users-api-models';
import { MustMatch } from 'src/app/components/settings/settings-security/_helpers/must-match.validator';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

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
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent {
  registerForm = this.fb.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, passwordValidator()]],
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

  constructor(private fb: FormBuilder,
    private userServiceProvider: UserServiceProvider,
    private router: Router) { }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.registerForm.disable();
    this.genericError = false;
    this.emailAlreadyExistsError = false;

    const user = {
      "role": this.registerForm.controls.role.value,
      "firstname": this.registerForm.controls.firstName.value,
      "lastname": this.registerForm.controls.lastName.value,
      "email": this.registerForm.controls.email.value,
    } as User;

    this.userServiceProvider.default().register(user, this.registerForm.controls.password.value).toPromise().then(value => {
      this.loading = false;
      this.router.navigate(["/login"]);
    }, error => {
      this.loading = false;
      this.registerForm.enable();

      if (error instanceof HttpErrorResponse && error.status == 409) {
        this.emailAlreadyExistsError = true;
      } else {
        this.genericError = true;
      }
    });
  }


}
