import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users/users.service';

const LAST_DEVICE_NAME_LOCALSTORAGE_KEY = 'lastDeviceName';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements AfterViewInit {
  loginForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, Validators.required],
    deviceName: [null, Validators.required],
  });

  hidePassword = true;
  loading = false;
  wrongCredentialError = false;
  tooManyErrors = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.wrongCredentialError = false;
    this.tooManyErrors = false;
    this.loginForm.disable();
    localStorage.setItem(
        LAST_DEVICE_NAME_LOCALSTORAGE_KEY,
        this.loginForm.controls.deviceName.value,
    );

    this.usersService
        .login(
            this.loginForm.controls.email.value,
            this.loginForm.controls.password.value,
            this.loginForm.controls.deviceName.value,
        )
        .toPromise()
        .then(() => this.router.navigate(['/files']))
        .catch((err) => {
          this.wrongCredentialError =
              err instanceof HttpErrorResponse && err.status === 401;
          this.tooManyErrors =
              err instanceof HttpErrorResponse && err.status === 429;

          if (!this.wrongCredentialError && !this.tooManyErrors) throw err;
          else {
            this.loginForm.enable();
            this.loading = false;
          }
        });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (localStorage.getItem(LAST_DEVICE_NAME_LOCALSTORAGE_KEY)) {
        this.loginForm.controls.deviceName.setValue(
            localStorage.getItem(LAST_DEVICE_NAME_LOCALSTORAGE_KEY),
        );
      }
    }, 10);
  }
}
