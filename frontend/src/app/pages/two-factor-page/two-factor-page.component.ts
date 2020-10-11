import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserServiceProvider } from '../../services/users/user-service-provider'

@Component({
  selector: 'app-two-factor-page',
  templateUrl: './two-factor-page.component.html',
  styleUrls: ['./two-factor-page.component.css']
})

export class TwoFactorPageComponent implements OnInit {
  twoFactorForm = this.fb.group({
    verificationCode: [null, Validators.required]
  });

  constructor(private fb: FormBuilder, private user: UserServiceProvider) { }

  onSubmit() {
    if(this.twoFactorForm.invalid){
      return;
    }
    
    // this.user.default().verifyTwoAuth(verificationCode);
  }

  ngOnInit() {
    this.twoFactorForm = this.fb.group({
      verificationCode: [null, Validators.required]
    });
  }
}
