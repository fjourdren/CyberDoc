import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesUploadProgressSnackbarComponent } from './files-upload-progress-snackbar.component';

describe('FilesUploadOverlayComponent', () => {
  let component: FilesUploadProgressSnackbarComponent;
  let fixture: ComponentFixture<FilesUploadProgressSnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesUploadProgressSnackbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesUploadProgressSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
