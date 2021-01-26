import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsSessionCardComponent } from './settings-session-card.component';

describe('SettingsSessionCardComponent', () => {
  let component: SettingsSessionCardComponent;
  let fixture: ComponentFixture<SettingsSessionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsSessionCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsSessionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
