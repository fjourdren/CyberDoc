import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { User } from 'src/app/models/users-api-models';
import { MustMatch } from 'src/app/components/settings/settings-security/_helpers/must-match.validator';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'src/app/services/users/users.service';

function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const password = control.value;

    if (!password) return { passwordValidator: { invalid: true } };
    if (!password.match(/[A-Z]/g))
      return { passwordValidator: { invalid: true } };
    if (!password.match(/[a-z]/g))
      return { passwordValidator: { invalid: true } };
    if (!password.match(/[0-9]/g))
      return { passwordValidator: { invalid: true } };
    if (!password.replace(/[0-9a-zA-Z ]/g, '').length)
      return { passwordValidator: { invalid: true } };

    return null;
  };
}

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent {
  hidePassword = true;
  loading = false;
  emailAlreadyExistsError = false;
  tooManyRequestsError = false;
  registerForm: FormGroup;
  email: string;
  fileOwnerEmail: string;
  fileId: string;
  canShowCheckLegalError = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    // Manage registering after file sharing
    this.route.queryParams.subscribe((params) => {
      if (params['data']) {
        const cut: string[] = params['data'].split(';');

        this.email = cut[0];
        this.fileOwnerEmail = cut[1];
      }
    });

    this.registerForm = this.fb.group(
      {
        firstName: [null, Validators.required],
        lastName: [null, Validators.required],
        email: [
          { value: this.email, disabled: !!this.email },
          [Validators.required, Validators.email],
        ],
        password: [null, [Validators.required, passwordValidator()]],
        repeat: [null, Validators.required],
        role: ['owner', Validators.required],
        checkLegal: [null, Validators.required],
      },
      {
        validator: MustMatch('password', 'repeat'),
      },
    );
  }

  onSubmit(): void {
    this.canShowCheckLegalError = true;
    if (
      this.registerForm.invalid ||
      (this.email && this.registerForm.controls.email.value !== this.email)
    ) {
      return;
    }

    this.loading = true;
    this.registerForm.disable();
    this.emailAlreadyExistsError = false;
    this.tooManyRequestsError = false;

    const user = {
      role: this.registerForm.controls.role.value,
      firstname: this.registerForm.controls.firstName.value,
      lastname: this.registerForm.controls.lastName.value,
      email: this.email || this.registerForm.controls.email.value,
    } as User;

    this.usersService
      .register(user, this.registerForm.controls.password.value)
      .toPromise()
      .then(
        () => {
          this.loading = false;
          this.router.navigate(['/login']);
        },
        (error) => {
          this.loading = false;
          this.registerForm.enable();

          if (error instanceof HttpErrorResponse && error.status === 409) {
            this.emailAlreadyExistsError = true;
          } else if (
            error instanceof HttpErrorResponse &&
            error.status === 429
          ) {
            this.tooManyRequestsError = true;
          } else {
            throw error;
          }
        },
      );
  }
}
