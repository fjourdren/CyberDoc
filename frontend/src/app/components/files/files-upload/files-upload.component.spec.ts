import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesUploadComponent } from './files-upload.component';

describe('FilesCreateFabComponent', () => {
  let component: FilesUploadComponent;
  let fixture: ComponentFixture<FilesUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesUploadComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
