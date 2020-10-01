import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { UserServiceProvider } from '../../../services/users/user-service-provider'
import { User } from 'src/app/models/users-api-models';
import { DatePipe } from '@angular/common';

/*const USER: User = {
  "role": "collaborater",
  "updated_at": "2020-09-22T11:31:20.714Z",
  "created_at": "2020-09-22T11:30:54.556Z",
  "_id": "65af88e0-4d6f-80da-1cab-6ef5db2c719e",
  "firstname": "Flavien",
  "lastname": "JOURDREN",
  "email": "test.jourdren@gmail.com",
  "rootDirectoryID": "root",
}*/
@Component({
  selector: 'app-formulaire',
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.css'],
  providers: [DatePipe]
})
export class FormulaireComponent implements OnInit {
  addressForm = this.fb.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    email: [null, Validators.required],
    password: [null, Validators.required],
    repeat: [null, Validators.required],
    state: ['collaborator', Validators.required],
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
    if (this.addressForm.invalid) {
      alert('Error !');
      return;
    }

   

    this.user = {
    "role": this.addressForm.controls.state.value,
    "firstname": this.addressForm.controls.firstName.value,
    "lastname": this.addressForm.controls.lastName.value,
    "email": this.addressForm.controls.email.value,
  } as User;

    this.userProvider.default().register(this.user).toPromise().then(value => { console.log(value) });
  }

/*getErrorMessage() {
  if (this.email.hasError('required')) {
    return 'You must enter a value';
  }

  return this.email.hasError('email') ? 'Not a valid email' : '';
}*/
ngOnInit() {
  //this.email = new FormControl('', [Validators.required, Validators.email]);
  this.addressForm = this.fb.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    email: [null, Validators.required],
    password: [null, Validators.required],
    repeat: [null, Validators.required],
    state: ['collaborator', Validators.required],
  });
}
  
}
