import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesFilterToolbarComponent } from './files-filter-toolbar.component';

describe('FilesFilterToolbarComponent', () => {
  let component: FilesFilterToolbarComponent;
  let fixture: ComponentFixture<FilesFilterToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesFilterToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesFilterToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
