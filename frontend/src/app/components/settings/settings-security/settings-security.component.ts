import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { MustMatch } from './_helpers/must-match.validator';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TwoFactorServiceProvider } from 'src/app/services/twofactor/twofactor-service-provider';

export interface DialogData {
  authy_id: string;
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

  twoFactorApp: boolean;
  twoFactorSms: boolean;
  twoFactorEmail: boolean;

  constructor(private userServiceProvider: UserServiceProvider, 
    private twoFactorServiceProvider: TwoFactorServiceProvider,
    private fb: FormBuilder, private snackBar: MatSnackBar, private dialog: MatDialog) { }

  passwordStrength = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}';
  
  ngOnInit() {
    this.email = this.userServiceProvider.default().getActiveUser().email;
    this.phoneNumber = this.userServiceProvider.default().getActiveUser().phone_number;
    this.authy_id = this.userServiceProvider.default().getActiveUser().authy_id;
    this.twoFactorServiceProvider.default().isTwoFactorAppActivated().toPromise().then(res => {
      this.twoFactorApp = res;
    });
    this.twoFactorServiceProvider.default().isTwoFactorSmsActivated().toPromise().then(res => {
      this.twoFactorSms = res;
    });
    this.twoFactorServiceProvider.default().isTwoFactorEmailActivated().toPromise().then(res => {
      this.twoFactorEmail = res;
    });
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
  openDialogActivateTwoFactor(type: string): void {
    console.log(this.userServiceProvider.default().getActiveUser().authy_id);
    if(this.userServiceProvider.default().getActiveUser().authy_id == null) {
      this.snackBar.open('You must enter your phone number in your profile to enable 2FA', null, { duration: 3000 });
    } else {
      switch(type) {
        case 'app':
          this.twoFactorServiceProvider.default().generateQrCode(this.email, this.authy_id).toPromise().then(res => {
            this.dialog.open(SettingsSecurityDialogComponent, {
              width: '500px',
              data: {
                authy_id: this.authy_id,
                qrCodeUrl: res,
                email: null,
                phoneNumber: null
              }
            });
          });
          break;
        case 'sms':
          this.twoFactorServiceProvider.default().sendToken('sms', this.authy_id).toPromise().then(res => {
            this.dialog.open(SettingsSecurityDialogComponent, {
              width: '500px',
              data: {
                authy_id: this.authy_id,
                qrCodeUrl: null,
                email: null,
                phoneNumber: this.phoneNumber
              }
            });
          });
          break;
        case 'email':
          this.twoFactorServiceProvider.default().sendToken('email', this.authy_id).toPromise().then(res => {
            this.dialog.open(SettingsSecurityDialogComponent, {
              width: '500px',
              data: {
                authy_id: this.authy_id,
                qrCodeUrl: null,
                email: this.email,
                phoneNumber: null
              }
            });
          });
          break;
      } 
    }
  }

  disableTwoFactor(type: string): void {
    this.userServiceProvider.default().updateTwoFactor(
      type == 'app' ? !this.userServiceProvider.default().getActiveUser().twoFactorApp : this.userServiceProvider.default().getActiveUser().twoFactorApp, // twoFactorApp
      type == 'sms' ? !this.userServiceProvider.default().getActiveUser().twoFactorSms : this.userServiceProvider.default().getActiveUser().twoFactorSms, // twoFactorSms
      type == 'email' ? !this.userServiceProvider.default().getActiveUser().twoFactorEmail : this.userServiceProvider.default().getActiveUser().twoFactorEmail, // twoFactorEmail
      this.userServiceProvider.default().getActiveUser().email
    ).toPromise().then(res => {
      this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
        this.snackBar.open('2FA disabled', null, { duration: 1500 });
      }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
    });
   
  }
}

@Component({
  selector: 'settings-security-dialog',
  templateUrl: 'settings-security-dialog.component.html',
})
export class SettingsSecurityDialogComponent {
  tokenForm: FormGroup;
  twoFactorApp: boolean;
  twoFactorEmail: boolean;
  twoFactorSms: boolean;

  constructor(private fb: FormBuilder, 
    private twoFactorServiceProvider: TwoFactorServiceProvider,
    private userServiceProvider: UserServiceProvider,
    private snackBar: MatSnackBar, 
    public dialogRef: MatDialogRef<SettingsSecurityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit() {
    this.tokenForm = this.fb.group({
      token: [null, [Validators.required, Validators.pattern('[0-9]{6,7}'), Validators.minLength(6), Validators.maxLength(7)]]
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmitToken() {
    this.twoFactorServiceProvider.default().verifyToken(this.data.authy_id, this.tokenForm.get('token').value).toPromise().then(res => {
      if(res) {
        this.userServiceProvider.default().updateTwoFactor(
          this.data.qrCodeUrl ? true : this.userServiceProvider.default().getActiveUser().twoFactorApp, 
          this.data.phoneNumber ? true : this.userServiceProvider.default().getActiveUser().twoFactorSms, 
          this.data.email ? true : this.userServiceProvider.default().getActiveUser().twoFactorEmail, 
          this.userServiceProvider.default().getActiveUser().email
        ).toPromise().then(() => {
          this.dialogRef.close();       
          this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
            this.snackBar.open('2FA activated', null, { duration: 1500 });
          }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
        });
      }
    }).catch(err => {
      this.snackBar.open(err.error.message, null, { duration: 1500 })
    })
  }

  get f() { return this.tokenForm.controls; }
}
