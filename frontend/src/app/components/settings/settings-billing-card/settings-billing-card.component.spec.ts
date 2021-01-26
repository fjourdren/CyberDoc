import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsBillingCardComponent } from './settings-billing-card.component';

describe('SettingsBillingCardComponent', () => {
  let component: SettingsBillingCardComponent;
  let fixture: ComponentFixture<SettingsBillingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsBillingCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsBillingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
