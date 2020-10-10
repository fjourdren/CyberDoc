import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserServiceProvider } from '../../services/users/user-service-provider'
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})

export class LoginPageComponent {
  loginForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, Validators.required],
  });

  hidePassword = true;
  loading = false;
  errorValidator = false;
  errorServer = false;

  constructor(private fb: FormBuilder,
    private user: UserServiceProvider,
    private router: Router) { }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorServer = false;
    this.errorValidator = false;
    this.loginForm.get("email").disable();
    this.loginForm.get("password").disable();

    this.user.default().login(this.loginForm.controls.email.value, this.loginForm.controls.password.value).toPromise().then(value => {
      this.loading = false;
      this.router.navigate(["/files"]);
    }, error => {
      this.loading = false;
      this.loginForm.get("email").enable();
      this.loginForm.get("password").enable();
  
      if (error instanceof HttpErrorResponse && error.status == 404) {
        this.errorValidator = true;
      } else {
        this.errorServer = true;
      }
    });
  }
}
