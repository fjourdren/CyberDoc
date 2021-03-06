import { Component } from '@angular/core';
import { UsersService } from '../../services/users/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup-billing-page',
  templateUrl: './setup-billing-page.component.html',
  styleUrls: ['./setup-billing-page.component.css'],
})
export class SetupBillingPageComponent {
  loading = false;
  selectedPlan = '';

  constructor(private usersService: UsersService, private router: Router) {
    if (usersService.getActiveUser().subscription) {
      router.navigate(['/settings/profile']);
    }
  }

  onBillingPlanSelected(planID: string) {
    this.selectedPlan = planID;
    this.loading = true;
    this.usersService.setupSubscription(planID);
  }
}
