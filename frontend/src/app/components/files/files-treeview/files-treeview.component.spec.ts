import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesTreeviewComponent } from './files-treeview.component';

describe('FilesTreeviewComponent', () => {
  let component: FilesTreeviewComponent;
  let fixture: ComponentFixture<FilesTreeviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesTreeviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesTreeviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
