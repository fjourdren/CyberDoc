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

  constructor(private userServiceProvider: UserServiceProvider, private fb: FormBuilder, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.profileForm = this.fb.group({
      firstName: [this.userServiceProvider.default().getActiveUser().firstname, Validators.required],
      lastName: [this.userServiceProvider.default().getActiveUser().lastname, Validators.required],
      newEmail: [this.userServiceProvider.default().getActiveUser().email, [Validators.required, Validators.email]],
      oldEmail: [this.userServiceProvider.default().getActiveUser().email, [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    console.warn(this.profileForm.value);
    this.updateProfile();
  }

  updateProfile() {
    this.userServiceProvider.default().updateProfile(
      this.profileForm.get('firstName').value,
      this.profileForm.get('lastName').value,
      this.profileForm.get('newEmail').value,
      this.userServiceProvider.default().getActiveUser().email
    ).toPromise().then(() => this.snackBar.open('Profile updated', null, { duration: 1500 })).catch(err => console.error(err));
  }

  deleteAccount() {
    this.userServiceProvider.default().deleteAccount();
  }
}
