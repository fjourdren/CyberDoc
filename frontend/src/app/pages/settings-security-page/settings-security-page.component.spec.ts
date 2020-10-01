import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsSecurityPageComponent } from './settings-security-page.component';

describe('SettingsSecurityPageComponent', () => {
  let component: SettingsSecurityPageComponent;
  let fixture: ComponentFixture<SettingsSecurityPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsSecurityPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsSecurityPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
