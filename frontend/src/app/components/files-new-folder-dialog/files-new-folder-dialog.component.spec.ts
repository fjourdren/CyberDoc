import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesNewFolderDialogComponent } from './files-new-folder-dialog.component';

describe('FilesNewFolderDialogComponent', () => {
  let component: FilesNewFolderDialogComponent;
  let fixture: ComponentFixture<FilesNewFolderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesNewFolderDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesNewFolderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
