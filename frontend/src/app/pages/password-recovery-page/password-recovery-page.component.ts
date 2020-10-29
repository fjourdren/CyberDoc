import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserServiceProvider } from '../../services/users/user-service-provider'
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-recovery-page',
  templateUrl: './password-recovery-page.component.html',
  styleUrls: ['./password-recovery-page.component.scss']
})

export class PasswordRecoveryPageComponent {
  recoverForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
  });

  loading = false;
  wrongCredentialError = false;
  genericError = false;
  recovered = false;

  constructor(private fb: FormBuilder,
    private userServiceProvider: UserServiceProvider,
    private router: Router) { }

  onSubmit() {
    if (this.recoverForm.invalid) {
      return;
    }

    this.loading = true;
    this.genericError = false;
    this.wrongCredentialError = false;
    this.recovered = false;
    this.recoverForm.get("email").disable();

    this.userServiceProvider.default().recoverPassword(this.recoverForm.controls.email.value).toPromise().then(value => {
      this.loading = false;
      this.recovered = true;
    }, error => {
      this.loading = false;
      this.recoverForm.get("email").enable();  
      if (error instanceof HttpErrorResponse && error.status == 401) {
        this.wrongCredentialError = true;
      } else {
        this.genericError = true;
      }
    });
  }
}

