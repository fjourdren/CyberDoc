import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { UserServiceProvider } from '../../services/users/user-service-provider'
import { User } from 'src/app/models/users-api-models';
import { DatePipe } from '@angular/common';
import { MustMatch } from 'src/app/components/settings/settings-security/_helpers/must-match.validator';

/*const USER: User = {
  "role": "owner",
  "updated_at": "2020-09-22T11:31:20.714Z",
  "created_at": "2020-09-22T11:30:54.556Z",
  "_id": "65af88e0-4d6f-80da-1cab-6ef5db2c719e",
  "firstname": "Flavien",
  "lastname": "JOURDREN",
  "email": "test.jourdren@gmail.com",
  "rootDirectoryID": "root",
}*/
@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css'],
  providers: [DatePipe]
})
export class RegisterPageComponent implements OnInit {
  registerForm = this.fb.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    email: [null, Validators.required],
    password: [null, Validators.required],
    repeat: [null, Validators.required],
    state: ['owner', Validators.required],
  });

  hide = true;

  // L'utilisateur :
  user: User;
  //La date du jour :
  myDate = new Date();
  hasUnitNumber = false;

  //email = new FormControl('', [Validators.required, Validators.email]);

  constructor(private fb: FormBuilder, private userProvider: UserServiceProvider) { }

  onSubmit() {
    if (this.registerForm.invalid) {
      //alert('Error !');
      return;
    }

    this.user = {
      "role": this.registerForm.controls.state.value,
      "firstname": this.registerForm.controls.firstName.value,
      "lastname": this.registerForm.controls.lastName.value,
      "email": this.registerForm.controls.email.value,
    } as User;

    //this.userProvider.default().register(this.user);
  }

/*getErrorMessage() {
  if (this.email.hasError('required')) {
    return 'You must enter a value';
  }

  return this.email.hasError('email') ? 'Not a valid email' : '';
}*/

passwordStrength = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}';
ngOnInit() {
  //this.email = new FormControl('', [Validators.required, Validators.email]);
  this.registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
    repeat: ['', Validators.required],
    state: ['owner', Validators.required],
  }, {
    validator: MustMatch('password', 'repeat')
  });
}
  
}
