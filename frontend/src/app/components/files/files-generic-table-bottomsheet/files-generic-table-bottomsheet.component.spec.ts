import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesGenericTableBottomsheetComponent } from './files-generic-table-bottomsheet.component';

describe('FilesGenericTableBottomsheetComponent', () => {
  let component: FilesGenericTableBottomsheetComponent;
  let fixture: ComponentFixture<FilesGenericTableBottomsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesGenericTableBottomsheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesGenericTableBottomsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
