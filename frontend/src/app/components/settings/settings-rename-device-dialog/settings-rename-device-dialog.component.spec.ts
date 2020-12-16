import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsRenameDeviceDialogComponent } from './settings-rename-device-dialog.component';

describe('SettingsRenameDeviceDialogComponent', () => {
  let component: SettingsRenameDeviceDialogComponent;
  let fixture: ComponentFixture<SettingsRenameDeviceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsRenameDeviceDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsRenameDeviceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
