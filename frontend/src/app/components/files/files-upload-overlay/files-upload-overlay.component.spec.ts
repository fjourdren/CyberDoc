import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesUploadOverlayComponent } from './files-upload-overlay.component';

describe('FilesUploadOverlayComponent', () => {
  let component: FilesUploadOverlayComponent;
  let fixture: ComponentFixture<FilesUploadOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesUploadOverlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesUploadOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
