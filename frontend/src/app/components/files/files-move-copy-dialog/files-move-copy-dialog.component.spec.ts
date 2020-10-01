import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesMoveCopyDialogComponent } from './files-move-copy-dialog.component';

describe('FilesMoveCopyDialogComponent', () => {
  let component: FilesMoveCopyDialogComponent;
  let fixture: ComponentFixture<FilesMoveCopyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesMoveCopyDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesMoveCopyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
