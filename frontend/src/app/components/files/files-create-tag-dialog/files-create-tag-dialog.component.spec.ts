import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesCreateTagDialogComponent } from './files-create-tag-dialog.component';

describe('FilesCreateTagDialogComponent', () => {
  let component: FilesCreateTagDialogComponent;
  let fixture: ComponentFixture<FilesCreateTagDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesCreateTagDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesCreateTagDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
