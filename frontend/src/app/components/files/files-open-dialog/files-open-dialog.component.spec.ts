import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesOpenDialogComponent } from './files-open-dialog.component';

describe('FilesOpenDialogComponent', () => {
  let component: FilesOpenDialogComponent;
  let fixture: ComponentFixture<FilesOpenDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesOpenDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesOpenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
