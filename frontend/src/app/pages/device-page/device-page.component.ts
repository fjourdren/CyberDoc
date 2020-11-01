import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserServiceProvider } from '../../services/users/user-service-provider'
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Devices } from 'src/app/models/users-api-models';
import { element } from 'protractor';

@Component({
  selector: 'app-device-page',
  templateUrl: './device-page.component.html',
  styleUrls: ['./device-page.component.scss']
})

export class DevicePageComponent implements OnInit {
  recoverForm = this.fb.group({
    name: [null, Validators.required],
  });

  loading = false;
  wrongCredentialError = false;
  genericError = false;
  nameAlreadyChoose = false;
  nameExist = false;
  private device: Devices;

  constructor(private fb: FormBuilder,
    private userServiceProvider: UserServiceProvider,
    private router: Router) {
      this.checkDevice();
    }


  checkDevice(){
    this.userServiceProvider.default().getUserDevices().toPromise().then(result => {  
      //let device = result.filter(result=>result.OS===navigator.appVersion && result.browser===navigator.appName);
      
      for(this.device of result){
        if(this.device.OS===navigator.platform && this.device.browser===navigator.appName){
          console.log("Name exist");
          this.nameExist = true;
        }
      }
    });
  }

  ngOnInit() {
    this.checkDevice();
  }

  onSubmit() {
    if (this.recoverForm.invalid) {
      return;
    }

    this.loading = true;
    this.genericError = false;
    this.recoverForm.get("name").disable();

    this.userServiceProvider.default().createUserDevices(this.recoverForm.controls.name.value, navigator.appName, navigator.platform).toPromise().then(value => {
      this.loading = false;
      this.nameExist = true;
    }, error => {
      this.loading = false;
      this.recoverForm.get("name").enable();  
      if (error instanceof HttpErrorResponse && error.status === 400) {
        this.nameAlreadyChoose = true;
    } else {
        this.genericError = true;
    }
    });
  }
}

