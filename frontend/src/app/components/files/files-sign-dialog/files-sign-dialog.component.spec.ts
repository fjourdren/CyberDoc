import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesSignDialogComponent } from './files-sign-dialog.component';

describe('FilesSignDialogComponent', () => {
  let component: FilesSignDialogComponent;
  let fixture: ComponentFixture<FilesSignDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesSignDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesSignDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
