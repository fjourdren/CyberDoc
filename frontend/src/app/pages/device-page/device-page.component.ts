import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users/users.service';

//TODO use https://github.com/KoderLabs/ngx-device-detector
@Component({
  selector: 'app-device-page',
  templateUrl: './device-page.component.html',
  styleUrls: ['./device-page.component.scss'],
})
export class DevicePageComponent {
  newDeviceForm = this.fb.group({
    name: [null, [Validators.required, this.noWhitespaceValidator]],
  });

  nameAlreadyChoose = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router,
  ) {}

  onSubmit() {
    if (this.newDeviceForm.invalid) {
      return;
    }

    this.newDeviceForm.get('name').disable();
    this.nameAlreadyChoose = false;
    this.loading = true;

    /*let os = this.parser.getOS().name;
    if (this.parser.getDevice().model) {
      os = `${this.parser.getDevice().model} ${os}`;
    }*/
    const os = 'UNKNOWN';
    const browser = 'UNKNOWN';

    this.usersService
      .createUserDevice(this.newDeviceForm.controls.name.value, browser, os)
      .toPromise()
      .then(
        () => {
          this.router.navigate(['/files']);
        },
        (error) => {
          this.newDeviceForm.get('name').enable();
          this.loading = false;
          if (error instanceof HttpErrorResponse && error.status === 400) {
            this.nameAlreadyChoose = true;
          } else {
            throw error;
          }
        },
      );
  }

  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }
}
