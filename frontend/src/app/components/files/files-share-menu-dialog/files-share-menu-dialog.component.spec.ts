import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesShareMenuDialogComponent } from './files-share-menu-dialog.component';

describe('FilesShareMenuDialogComponent', () => {
  let component: FilesShareMenuDialogComponent;
  let fixture: ComponentFixture<FilesShareMenuDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesShareMenuDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesShareMenuDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
