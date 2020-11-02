import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsTwofaConfigureDialogComponent } from './settings-twofa-configure-dialog.component';

describe('SettingsTwofaConfigureDialogComponent', () => {
  let component: SettingsTwofaConfigureDialogComponent;
  let fixture: ComponentFixture<SettingsTwofaConfigureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsTwofaConfigureDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsTwofaConfigureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
