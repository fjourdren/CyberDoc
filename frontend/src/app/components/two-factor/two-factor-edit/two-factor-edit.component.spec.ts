import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFactorEditComponent } from './two-factor-edit.component';

describe('TwoFactorEditComponent', () => {
  let component: TwoFactorEditComponent;
  let fixture: ComponentFixture<TwoFactorEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwoFactorEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoFactorEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
