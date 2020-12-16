import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFactorEditDialogComponent } from './two-factor-edit-dialog.component';

describe('SettingsTwofaConfigureDialogComponent', () => {
  let component: TwoFactorEditDialogComponent;
  let fixture: ComponentFixture<TwoFactorEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TwoFactorEditDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoFactorEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
