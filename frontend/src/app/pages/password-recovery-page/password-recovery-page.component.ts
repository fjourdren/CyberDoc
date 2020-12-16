import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-password-recovery-page',
  templateUrl: './password-recovery-page.component.html',
  styleUrls: ['./password-recovery-page.component.scss'],
})
export class PasswordRecoveryPageComponent {
  recoverForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
  });

  loading = false;
  wrongCredentialError = false;
  recovered = false;

  constructor(private fb: FormBuilder, private usersService: UsersService) {}

  onSubmit() {
    if (this.recoverForm.invalid) {
      return;
    }

    this.loading = true;
    this.wrongCredentialError = false;
    this.recovered = false;
    this.recoverForm.get('email').disable();

    this.usersService
      .recoverPassword(this.recoverForm.controls.email.value)
      .toPromise()
      .then(
        () => {
          this.loading = false;
          this.recovered = true;
        },
        (error) => {
          this.loading = false;
          this.recoverForm.get('email').enable();
          if (error instanceof HttpErrorResponse && error.status == 401) {
            this.wrongCredentialError = true;
          } else {
            throw error;
          }
        },
      );
  }
}
