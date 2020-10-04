import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { MustMatch } from './_helpers/must-match.validator';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-settings-security',
  templateUrl: './settings-security.component.html',
  styleUrls: ['./settings-security.component.css']
})
export class SettingsSecurityComponent implements OnInit {
  passwordForm: FormGroup;
  twoFactorSMSForm: FormGroup;
  isTextFieldType: boolean;
  isTextFieldType2: boolean;
  isTextFieldType3: boolean;
  twoFactorSMS: boolean;
  twoFactorApp: boolean;
  filter: any;

  constructor(private userServiceProvider: UserServiceProvider, private fb: FormBuilder, private snackBar: MatSnackBar) { }

  passwordStrength = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}';
  ngOnInit() {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
      newPasswordConfirmation: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
      email: [this.userServiceProvider.default().getActiveUser().email, Validators.required]
    }, {
      validator: MustMatch('newPassword', 'newPasswordConfirmation')
    });
    this.twoFactorSMSForm = this.fb.group({
      phoneNumber: [null, [Validators.required, Validators.pattern('[0-9]{10}')]]
    });
  }

  get f() { return this.passwordForm.controls; }

  onSubmitPassword() {
    console.warn(this.passwordForm.value);
    if (this.passwordForm.get('oldPassword').value !== null && this.passwordForm.get('newPassword').value !== null
      && this.passwordForm.get('newPasswordConfirmation').value !== null) {
      this.updatePassword();
    }
  }

  onSubmitTwoFactorSMS() {
    this.snackBar.open('An SMS has been sent to your phone number.', null, { duration: 3000 });
  }

  updatePassword() {
    if (this.passwordForm.get('newPassword').value != this.passwordForm.get('newPasswordConfirmation').value) {
      console.log('Passwords must match')
    } else {
      this.userServiceProvider.default().updatePassword(
        this.passwordForm.get('oldPassword').value,
        this.passwordForm.get('newPassword').value,
        this.userServiceProvider.default().getActiveUser().email
      ).toPromise().then(() => this.snackBar.open('Password updated', null, { duration: 1500 })).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
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
    return this.passwordForm.controls[controlName].hasError(errorName);
  }

  radioChange(event: MatRadioChange) {
    switch(event.value) {
      case "SMS":
        this.twoFactorApp = false;
        this.twoFactorSMS = true;
        break;
      case "App":
        this.twoFactorSMS = false;
        this.twoFactorApp = true;
        break;
      default:
        console.log('Impossible case');
        break;
    }
  }
}
