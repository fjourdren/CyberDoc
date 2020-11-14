import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportRecoveryKeyPageComponent } from './export-recovery-key-page.component';

describe('ExportRecoveryKeyPageComponent', () => {
  let component: ExportRecoveryKeyPageComponent;
  let fixture: ComponentFixture<ExportRecoveryKeyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportRecoveryKeyPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportRecoveryKeyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
