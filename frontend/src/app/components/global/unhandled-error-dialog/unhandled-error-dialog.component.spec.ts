import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnhandledErrorDialogComponent } from './unhandled-error-dialog.component';

describe('UnhandledErrorDialogComponent', () => {
  let component: UnhandledErrorDialogComponent;
  let fixture: ComponentFixture<UnhandledErrorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnhandledErrorDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnhandledErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
