import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { MustMatch } from './_helpers/must-match.validator';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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

  constructor(private userServiceProvider: UserServiceProvider, private fb: FormBuilder, private snackBar: MatSnackBar, private dialog: MatDialog) { }

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
  openDialogQrCode(): void {
    this.dialog.open(SettingsSecurityDialogComponent, {
      width: '500px',
      data: { qrCodeUrl: this.qrCodeUrl }
    });
  }

  openDialogSms(): void {
    this.dialog.open(SettingsSecurityDialogComponent, {
      width: '500px',
      data: { phoneNumber: this.phoneNumber }
    });
  }

  openDialogEmail(): void {
    this.dialog.open(SettingsSecurityDialogComponent, {
      width: '500px',
      data: { email: this.email }
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
      token: [null, [Validators.required, Validators.minLength(7), Validators.maxLength(7)]]
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmitToken() {
    console.warn(this.tokenForm.value);
  }
}
