import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupBillingPageComponent } from './setup-billing-page.component';

describe('SetupBillingPageComponent', () => {
  let component: SetupBillingPageComponent;
  let fixture: ComponentFixture<SetupBillingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetupBillingPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupBillingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
