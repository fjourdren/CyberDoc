import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

import { MustMatch } from './_helpers/must-match.validator';

@Component({
  selector: 'app-settings-security',
  templateUrl: './settings-security.component.html',
  styleUrls: ['./settings-security.component.css']
})
export class SettingsSecurityComponent implements OnInit {
  securityForm: FormGroup;
  isTextFieldType: boolean;
  isTextFieldType2: boolean;
  isTextFieldType3: boolean;

  constructor(private userServiceProvider: UserServiceProvider, private fb: FormBuilder, private snackBar: MatSnackBar) { }

  passwordStrength = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}';

  ngOnInit() {
    this.securityForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
      newPasswordConfirmation: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
      email: [this.userServiceProvider.default().getActiveUser().email, Validators.required]
    }, {
      validator: MustMatch('newPassword', 'newPasswordConfirmation')
    });
  }

  get f() { return this.securityForm.controls; }

  onSubmit() {
    console.warn(this.securityForm.value);
    if (this.securityForm.get('oldPassword').value !== null && this.securityForm.get('newPassword').value !== null
      && this.securityForm.get('newPasswordConfirmation').value !== null) {
      this.updatePassword();
    }
  }

  updatePassword() {

    if (this.securityForm.get('newPassword').value != this.securityForm.get('newPasswordConfirmation').value) {
      console.log('Passwords must match')
    } else {
      this.userServiceProvider.default().updatePassword(
        this.securityForm.get('oldPassword').value,
        this.securityForm.get('newPassword').value,
        this.userServiceProvider.default().getActiveUser().email
      ).toPromise().then(() => {
        this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
          this.snackBar.open('Password updated', null, { duration: 1500 });
        })
      }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
    }
  }

  toggleOldPasswordFieldType(evt: Event) {
    evt.preventDefault();
    this.isTextFieldType = !this.isTextFieldType;
  }
  toggleNewPasswordFieldType(evt: Event) {
    evt.preventDefault();
    this.isTextFieldType2 = !this.isTextFieldType2;
  }
  toggleNewPasswordConfirmFieldType(evt: Event) {
    evt.preventDefault();
    this.isTextFieldType3 = !this.isTextFieldType3;
  }

  public checkError = (controlName: string, errorName: string) => {
    return this.securityForm.controls[controlName].hasError(errorName);
  }
}
