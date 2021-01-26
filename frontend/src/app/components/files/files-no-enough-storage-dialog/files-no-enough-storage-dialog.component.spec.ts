import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesNoEnoughStorageDialogComponent } from './files-no-enough-storage-dialog.component';

describe('FilesNoEnoughStorageDialogComponent', () => {
  let component: FilesNoEnoughStorageDialogComponent;
  let fixture: ComponentFixture<FilesNoEnoughStorageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesNoEnoughStorageDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesNoEnoughStorageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
