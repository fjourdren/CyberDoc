import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { MustMatch } from './_helpers/must-match.validator';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TwoFactorServiceProvider } from 'src/app/services/twofactor/twofactor-service-provider';

export interface DialogData {
  qrCodeUrl: string;
  phoneNumber: string;
  email: string;
}

@Component({
  selector: 'app-settings-security',
  templateUrl: './settings-security.component.html',
  styleUrls: ['./settings-security.component.css']
})
export class SettingsSecurityComponent implements OnInit {
  // Forms
  passwordForm: FormGroup;

  // Passwords
  isTextFieldType: boolean;
  isTextFieldType2: boolean;
  isTextFieldType3: boolean;

  // Dialog
  dialogConfig: any;
  qrCodeUrl: string;
  phoneNumber: string;
  email: string;
  authy_id: string;

  constructor(private userServiceProvider: UserServiceProvider, 
    private twoFactorServiceProvider: TwoFactorServiceProvider,
    private fb: FormBuilder, private snackBar: MatSnackBar, private dialog: MatDialog) { }

  passwordStrength = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}';
  
  ngOnInit() {
    this.email = this.userServiceProvider.default().getActiveUser().email;
    this.phoneNumber = this.userServiceProvider.default().getActiveUser().phone_number;
    this.authy_id = this.userServiceProvider.default().getActiveUser().authy_id;

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
      newPasswordConfirmation: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
      email: [this.email, Validators.required]
    }, {
      validator: MustMatch('newPassword', 'newPasswordConfirmation')
    });

    this.dialogConfig = new MatDialogConfig(); 
  }

  get f() { return this.passwordForm.controls; }

  onSubmitPassword() {
    console.warn(this.passwordForm.value);
    if (this.passwordForm.get('oldPassword').value !== null && this.passwordForm.get('newPassword').value !== null
      && this.passwordForm.get('newPasswordConfirmation').value !== null) {
      this.updatePassword();
    }
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

  // Dialogs
  openDialog(type: string): void {
    switch(type) {
      case 'email':
        console.log('email');
        break;
      case 'sms':
        console.log('sms');
        break;
    }
    this.dialog.open(SettingsSecurityDialogComponent, {
      width: '500px',
      data: {
        qrCodeUrl: type == 'app' ? this.twoFactorServiceProvider.default().qrCode(this.email, this.authy_id) : null,
        email: type == 'email' ? this.email : null,
        phoneNumber: type =='sms' ? this.phoneNumber : null }
    });
  }
}

@Component({
  selector: 'settings-security-dialog',
  templateUrl: 'settings-security-dialog.component.html',
})
export class SettingsSecurityDialogComponent {
  tokenForm: FormGroup;

  constructor(private fb: FormBuilder, 
    public dialogRef: MatDialogRef<SettingsSecurityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit() {
    this.tokenForm = this.fb.group({
      token: [null, [Validators.required, Validators.pattern('[0-9]{7}'), Validators.minLength(7), Validators.maxLength(7)]]
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmitToken() {
    console.warn(this.tokenForm.value);
  }

  get f() { return this.tokenForm.controls; }
}
