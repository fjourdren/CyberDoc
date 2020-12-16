import { Component, ViewChild } from '@angular/core';
import { TwoFactorEditComponent } from '../../components/two-factor/two-factor-edit/two-factor-edit.component';

@Component({
  selector: 'app-two-factor-register-page',
  templateUrl: './two-factor-register-page.component.html',
  styleUrls: ['./two-factor-register-page.component.scss'],
})
export class TwoFactorRegisterPageComponent {
  @ViewChild(TwoFactorEditComponent) twoFactorEditComponent;
  twoFactorApp: boolean;
  twoFactorSms: boolean;

  updateTwoFactorApp($event: boolean): void {
    this.twoFactorApp = $event.valueOf();
  }

  updateTwoFactorSms($event: boolean): void {
    this.twoFactorSms = $event.valueOf();
  }
}
