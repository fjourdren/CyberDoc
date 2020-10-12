import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  

  constructor(private userServiceProvider: UserServiceProvider, private fb: FormBuilder, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.profileForm = this.fb.group({
      firstName: [this.userServiceProvider.default().getActiveUser().firstname, Validators.required],
      lastName: [this.userServiceProvider.default().getActiveUser().lastname, Validators.required],
      newEmail: [this.userServiceProvider.default().getActiveUser().email, [Validators.required, Validators.email]],
      oldEmail: [this.userServiceProvider.default().getActiveUser().email, [Validators.required, Validators.email]]
    });

    this.phoneNumberForm = this.fb.group({
      phoneNumber: [this.userServiceProvider.default().getActiveUser().phone_number, [Validators.required, Validators.pattern('[0-9]{10}')]]
    });
    console.log(this.userServiceProvider.default().getActiveUser());
  }

  onSubmitProfileForm() {
    console.warn(this.profileForm.value);
    this.updateProfile()
  }

  onSubmitPhoneNumberForm() {
    console.warn(this.phoneNumberForm.value);
    // Ouvrir Dialog pour valider le token reçu par SMS
    // Attention, le fait de changer de numéro de téléphone va (peut-être) modifier l'authy_id
    // /!\ à tester /!\
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
    });
  }

  deleteAccount() {
    this.userServiceProvider.default().deleteAccount();
  }
}
