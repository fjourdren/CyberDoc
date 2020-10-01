import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsProfilePageComponent } from './settings-profile-page.component';

describe('SettingsProfilePageComponent', () => {
  let component: SettingsProfilePageComponent;
  let fixture: ComponentFixture<SettingsProfilePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsProfilePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
