import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  UsersService,
  DEFAULT_THEME,
} from 'src/app/services/users/users.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  loginForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, Validators.required],
  });

  hidePassword = true;
  loading = false;
  wrongCredentialError = false;
  tooManyErrors = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router,
  ) {
    this.usersService.setTheme(DEFAULT_THEME);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.wrongCredentialError = false;
    this.tooManyErrors = false;
    this.loginForm.disable();

    this.usersService
      .login(
        this.loginForm.controls.email.value,
        this.loginForm.controls.password.value,
      )
      .toPromise()
      .then(
        () => {
          this.loading = false;
          this.router.navigate(['/files']);
        },
        (error) => {
          this.loading = false;
          this.loginForm.get('email').enable();
          this.loginForm.get('password').enable();

          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.wrongCredentialError = true;
          } else if (
            error instanceof HttpErrorResponse &&
            error.status === 429
          ) {
            this.tooManyErrors = true;
          }

          if (!this.wrongCredentialError && !this.tooManyErrors) throw error;
          else {
            this.loginForm.enable();
            this.loading = false;
          }
        },
      );
  }
}
