import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsDeleteTagDialogComponent } from './settings-delete-tag-dialog.component';

describe('SettingsDeleteTagDialogComponent', () => {
  let component: SettingsDeleteTagDialogComponent;
  let fixture: ComponentFixture<SettingsDeleteTagDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsDeleteTagDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsDeleteTagDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
