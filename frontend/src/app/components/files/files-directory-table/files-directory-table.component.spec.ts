import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesDirectoryTableComponent } from './files-directory-table.component';

describe('FilesTableComponent', () => {
  let component: FilesDirectoryTableComponent;
  let fixture: ComponentFixture<FilesDirectoryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesDirectoryTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesDirectoryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
