import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesRenameDialogComponent } from './files-rename-dialog.component';

describe('FilesRenameDialogComponent', () => {
  let component: FilesRenameDialogComponent;
  let fixture: ComponentFixture<FilesRenameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesRenameDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesRenameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
