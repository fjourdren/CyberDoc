import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserServiceProvider } from '../../services/users/user-service-provider'
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})

export class LoginPageComponent {
  loginForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, Validators.required],
  });

  hidePassword = true;
  loading = false;
  wrongCredentialError = false;
  genericError = false;

  constructor(private fb: FormBuilder,
    private userServiceProvider: UserServiceProvider,
    private router: Router) { }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.genericError = false;
    this.wrongCredentialError = false;
    this.loginForm.get("email").disable();
    this.loginForm.get("password").disable();

    this.userServiceProvider.default().login(this.loginForm.controls.email.value, this.loginForm.controls.password.value).toPromise().then(value => {
      this.loading = false;
      this.router.navigate(["/files"]);
    }, error => {
      this.loading = false;
      this.loginForm.get("email").enable();
      this.loginForm.get("password").enable();
  
      if (error instanceof HttpErrorResponse && error.status == 401) {
        this.wrongCredentialError = true;
      } else {
        this.genericError = true;
      }
    });
  }
}
