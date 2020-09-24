import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesDeleteDialogComponent } from './files-delete-dialog.component';

describe('FilesDeleteDialogComponent', () => {
  let component: FilesDeleteDialogComponent;
  let fixture: ComponentFixture<FilesDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesDeleteDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
