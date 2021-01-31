import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesUploadDragZoneComponent } from './files-upload-drag-zone.component';

describe('FilesUploadDragZoneComponent', () => {
  let component: FilesUploadDragZoneComponent;
  let fixture: ComponentFixture<FilesUploadDragZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesUploadDragZoneComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesUploadDragZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
