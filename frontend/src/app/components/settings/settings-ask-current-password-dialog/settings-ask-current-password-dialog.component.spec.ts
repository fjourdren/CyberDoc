import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAskCurrentPasswordDialogComponent } from './settings-ask-current-password-dialog.component';

describe('SettingsAskCurrentPasswordDialogComponent', () => {
  let component: SettingsAskCurrentPasswordDialogComponent;
  let fixture: ComponentFixture<SettingsAskCurrentPasswordDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsAskCurrentPasswordDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(
      SettingsAskCurrentPasswordDialogComponent,
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
