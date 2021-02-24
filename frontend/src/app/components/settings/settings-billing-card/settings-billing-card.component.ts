import { Component } from '@angular/core';
import { User } from '../../../models/users-api-models';
import { UsersService } from '../../../services/users/users.service';
import { TranslateService } from '@ngx-translate/core';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-settings-billing-card',
  templateUrl: './settings-billing-card.component.html',
  styleUrls: ['./settings-billing-card.component.css'],
})
export class SettingsBillingCardComponent {
  loading = false;
  user: User;
  storageSpacePercent: number;
  currentPlan: string;
  readonly stripeDisabled = environment.disableStripe;

  constructor(
    private usersService: UsersService,
    private translateService: TranslateService,
  ) {
    this.refresh();
    this.usersService.userUpdated().subscribe(() => this.refresh());
  }

  async refresh() {
    this.user = this.usersService.getActiveUser();
    this.storageSpacePercent = Math.min(
      (this.user.usedSpace / this.user.availableSpace) * 100,
      100,
    );

    if (this.user.subscription) {
      const currentPlan = this.user.subscription.planId;
      const planType = currentPlan.substring(0, currentPlan.indexOf('_'));

      const priceText = await this.translateService
        .get(`billing.${currentPlan}_price`)
        .toPromise();
      const availableStorageText = await this.translateService
        .get(`billing.${planType}_space`)
        .toPromise();

      this.currentPlan = `${availableStorageText} (${priceText})`;
    } else {
      const priceText = await this.translateService
        .get(`billing.free`)
        .toPromise();
      const availableStorageText = await this.translateService
        .get(`billing.freeplan_space`)
        .toPromise();

      this.currentPlan = `${availableStorageText} (${priceText})`;
    }
  }

  onManageSubscriptionBtnClicked() {
    this.loading = true;
    this.usersService.goToStripeCustomPortal();
  }
}
