import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {UserServiceProvider} from '../../services/users/user-service-provider'
import { first } from 'rxjs/operators';
import { User } from 'src/app/models/users-api-models';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})

export class LoginPageComponent implements OnInit {
  loginForm = this.fb.group({
    email: [null, Validators.required],
    password: [null, Validators.required],
    state: ['owner', Validators.required],
  });

  hide = true;
  hasUnitNumber = false;

 // email = new FormControl('', [Validators.required, Validators.email]);

  constructor(private fb: FormBuilder, private user: UserServiceProvider) { }

  onSubmit() {
    if(this.loginForm.invalid){
      //alert('Error !');
      return;
    }
    
    this.user.default().login(this.loginForm.controls.email.value, this.loginForm.controls.password.value).toPromise().then(value => {
      console.log(value);
      localStorage.setItem("__currentUser", JSON.stringify(value));
      location.pathname = "/files";
    });
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required],
    });
  }
}
