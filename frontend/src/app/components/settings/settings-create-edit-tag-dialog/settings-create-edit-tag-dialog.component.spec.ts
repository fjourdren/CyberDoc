import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsCreateEditTagDialogComponent } from './settings-create-edit-tag-dialog.component';

describe('SettingsCreateEditTagDialogComponent', () => {
  let component: SettingsCreateEditTagDialogComponent;
  let fixture: ComponentFixture<SettingsCreateEditTagDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsCreateEditTagDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsCreateEditTagDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
