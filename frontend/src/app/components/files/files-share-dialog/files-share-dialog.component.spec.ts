import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesShareDialogComponent } from './files-share-dialog.component';

describe('FilesShareDialogComponent', () => {
  let component: FilesShareDialogComponent;
  let fixture: ComponentFixture<FilesShareDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesShareDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesShareDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
