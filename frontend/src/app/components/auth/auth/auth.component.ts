import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {UserServiceProvider} from '../../../services/users/user-service-provider'
import { first } from 'rxjs/operators';
import { User } from 'src/app/models/users-api-models';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  addressForm = this.fb.group({
    email: [null, Validators.required],
    password: [null, Validators.required],
    state: ['collaborator', Validators.required],
  });

  hide = true;
  hasUnitNumber = false;

 // email = new FormControl('', [Validators.required, Validators.email]);

  constructor(private fb: FormBuilder, private user: UserServiceProvider) {
    
  }

  onSubmit() {
    //alert('Thanks!');
     // stop here if form is invalid
    if(this.addressForm.invalid){
      alert('Error !');
      return;
    }
    
    this.user.default().login(this.addressForm.controls.email.value, this.addressForm.controls.password.value).toPromise().then(value=>{console.log(value)});
  }
/*
  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }*/
  ngOnInit() {

    this.addressForm = this.fb.group({
      email: [null, Validators.required],
      password: [null, Validators.required],
    });
  }
}
