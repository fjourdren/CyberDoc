import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesRestoreDialogComponent } from './files-restore-dialog.component';

describe('FilesRestoreDialogComponent', () => {
  let component: FilesRestoreDialogComponent;
  let fixture: ComponentFixture<FilesRestoreDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesRestoreDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesRestoreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
