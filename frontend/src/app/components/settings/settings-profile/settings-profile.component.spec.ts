import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsProfileComponent } from './settings-profile.component';

describe('SettingsProfileComponent', () => {
  let component: SettingsProfileComponent;
  let fixture: ComponentFixture<SettingsProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
