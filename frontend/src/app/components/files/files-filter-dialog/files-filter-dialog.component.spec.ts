import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesFilterDialogComponent } from './files-filter-dialog.component';

describe('FilesFilterDialogComponent', () => {
  let component: FilesFilterDialogComponent;
  let fixture: ComponentFixture<FilesFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
