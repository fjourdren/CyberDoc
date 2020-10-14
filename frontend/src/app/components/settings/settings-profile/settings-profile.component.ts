import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TwoFactorServiceProvider } from 'src/app/services/twofactor/twofactor-service-provider';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../settings-security/settings-security.component';

@Component({
  selector: 'app-settings-profile',
  templateUrl: './settings-profile.component.html',
  styleUrls: ['./settings-profile.component.css']
})
export class SettingsProfileComponent {
  profileForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    newEmail: new FormControl(''),
    oldEmail: new FormControl('')
  });
  
  phoneNumberForm = new FormGroup({
    phoneNumber: new FormControl('')
  });

  dialogConfig: any;
  phoneNumber: any;
  inputPhoneNumber: any;

  constructor(
    private userServiceProvider: UserServiceProvider, 
    private twoFactorServiceProvider: TwoFactorServiceProvider,
    private fb: FormBuilder, private snackBar: MatSnackBar, private dialog: MatDialog) { }

  ngOnInit() {
    this.profileForm = this.fb.group({
      firstName: [this.userServiceProvider.default().getActiveUser().firstname, Validators.required],
      lastName: [this.userServiceProvider.default().getActiveUser().lastname, Validators.required],
      newEmail: [this.userServiceProvider.default().getActiveUser().email, [Validators.required, Validators.email]],
      oldEmail: [this.userServiceProvider.default().getActiveUser().email, [Validators.required, Validators.email]]
    });

    this.phoneNumberForm = this.fb.group({
      phoneNumber: [this.userServiceProvider.default().getActiveUser().phone_number, [Validators.required, Validators.pattern('\\+[0-9]{1,3}[0-9]{7,9}')]]
    });
    
    this.dialogConfig = new MatDialogConfig(); 
  }

  getNumber(obj) {
    this.phoneNumber = obj; // [country_code][phone_number]
  }

  onSubmitProfileForm() {
    console.warn(this.profileForm.value);
    this.updateProfile()
  }

  onSubmitPhoneNumberForm() {
    console.log('cellphone =', this.phoneNumber.substring(3), '/ countrycode = ', this.phoneNumber.substring(0, 3));
    this.twoFactorServiceProvider.default().add(                  // Add the user in Authy Database
      this.userServiceProvider.default().getActiveUser().email,   // Email
      this.phoneNumber.substring(3),                                   // Phone Number
      this.phoneNumber.substring(0, 3)                                 // Country code
    ).toPromise().then(res => {
      console.log('AUTHY_ID = ', res)
      // Update authy_id of user
      this.userServiceProvider.default().updateAuthyId(res, this.userServiceProvider.default().getActiveUser().email).toPromise();
      // Send token by SMS in order to verify that it is indeed user's phone number
      this.twoFactorServiceProvider.default().sendToken('sms', this.userServiceProvider.default().getActiveUser().authy_id).toPromise().then(() => {
        this.dialog.open(SettingsProfileDialogComponent, {
          width: '500px',
          data: {
            authy_id: res,
            qrCodeUrl: null,
            email: null,
            phoneNumber: this.phoneNumber
          }
        });
      });
    }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
  }

  updateProfile() {
    this.userServiceProvider.default().updateProfile(
      this.profileForm.get('firstName').value,
      this.profileForm.get('lastName').value,
      this.profileForm.get('newEmail').value,
      this.userServiceProvider.default().getActiveUser().email
    ).toPromise().then(() => {
      this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
        this.snackBar.open('Profile updated', null, { duration: 1500 });
      }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
    })
  }

  updatePhoneNumber() {
    this.userServiceProvider.default().updatePhoneNumber(
      this.userServiceProvider.default().getActiveUser().email,
      this.phoneNumberForm.get('phoneNumber').value
    ).toPromise().then(() => {
      this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
        this.snackBar.open('Phone number updated', null, { duration: 1500 });
      }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
    }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
  }

  deleteAccount() {
    this.userServiceProvider.default().deleteAccount();
  }
}

@Component({
  selector: 'settings-profile-dialog',
  templateUrl: 'settings-profile-dialog.component.html',
})
export class SettingsProfileDialogComponent {
  tokenForm: FormGroup;

  constructor(private fb: FormBuilder, 
    private twoFactorServiceProvider: TwoFactorServiceProvider,
    private userServiceProvider: UserServiceProvider,
    private snackBar: MatSnackBar, 
    public dialogRef: MatDialogRef<SettingsProfileDialogComponent>,
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
      if(res == true) {
        this.dialogRef.close();
        this.snackBar.open('Valid token ! Your phone number has been updated.', null, { duration: 1500 })
      }
    }).catch(err => {
      this.snackBar.open(err.error.message, null, { duration: 1500 })
    })
  }

  get f() { return this.tokenForm.controls; }
}
