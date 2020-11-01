import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserServiceProvider } from '../../services/users/user-service-provider'
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Devices } from 'src/app/models/users-api-models';
import { element } from 'protractor';
import {UAParser} from 'ua-parser-js';

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
  parser:any;

  constructor(private fb: FormBuilder,
    private userServiceProvider: UserServiceProvider,
    private router: Router) {
      this.checkDevice();
    }


  checkDevice(){
    this.userServiceProvider.default().getUserDevices().toPromise().then(result => {  
      //let device = result.filter(result=>result.OS===navigator.appVersion && result.browser===navigator.appName);
      
      for(this.device of result){
        const OS=this.parser.getDevice().model+" "+this.parser.getOS().name;
        console.log(OS);
        if(this.device.OS===OS && this.device.browser===this.parser.getBrowser().name){
          console.log("Name exist");
          this.nameExist = true;
        }
      }
    });
  }

  
  ngOnInit() {
    this.parser = new UAParser();
    console.log(this.parser.getResult());
    this.checkDevice();
  }

  onSubmit() {
    if (this.recoverForm.invalid) {
      return;
    }

    this.loading = true;
    this.genericError = false;
    this.recoverForm.get("name").disable();
    const OS=this.parser.getDevice().model+" "+this.parser.getOS().name;
    this.userServiceProvider.default().createUserDevices(this.recoverForm.controls.name.value, this.parser.getBrowser().name, OS).toPromise().then(value => {
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

