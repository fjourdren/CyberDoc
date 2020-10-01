import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesGenericTableComponent } from './files-generic-table.component';

describe('FilesGenericTableComponent', () => {
  let component: FilesGenericTableComponent;
  let fixture: ComponentFixture<FilesGenericTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesGenericTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesGenericTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
