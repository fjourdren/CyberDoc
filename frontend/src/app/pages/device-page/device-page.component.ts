import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserServiceProvider } from '../../services/users/user-service-provider'
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Device } from 'src/app/models/users-api-models';
import { element } from 'protractor';
import {UAParser} from 'ua-parser-js';

@Component({
  selector: 'app-device-page',
  templateUrl: './device-page.component.html',
  styleUrls: ['./device-page.component.scss']
})

export class DevicePageComponent implements OnInit {
  newDeviceForm = this.fb.group({
    name: [null, Validators.required],
  });


  genericError = false;
  nameAlreadyChoose = false;
  private device: Device;
  parser:any;

  constructor(private fb: FormBuilder,
    private userServiceProvider: UserServiceProvider,
    private router: Router) {
      
    }

  ngOnInit() {
    this.parser = new UAParser();
  }

  onSubmit() {
    if (this.newDeviceForm.invalid) {
      return;
    }

 
    this.genericError = false;
    this.newDeviceForm.get("name").disable();
    const OS=this.parser.getDevice().model+" "+this.parser.getOS().name;
    this.userServiceProvider.default().createUserDevice(this.newDeviceForm.controls.name.value, this.parser.getBrowser().name, OS).toPromise().then(value => {
      this.router.navigate(['/files']);
    }, error => {
      this.newDeviceForm.get("name").enable();  
      if (error instanceof HttpErrorResponse && error.status === 400) {
        this.nameAlreadyChoose = true;
    } else {
        this.genericError = true;
    }
    });
  }
}

