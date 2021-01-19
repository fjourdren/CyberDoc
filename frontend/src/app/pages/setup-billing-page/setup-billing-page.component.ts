import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-setup-billing-page',
  templateUrl: './setup-billing-page.component.html',
  styleUrls: ['./setup-billing-page.component.css'],
})
export class SetupBillingPageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  onBillingPlanSelected(planID: string) {
    alert(planID);
  }
}
