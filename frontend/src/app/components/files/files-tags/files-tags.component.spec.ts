import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesTagsComponent } from './files-tags.component';

describe('FilesTagsComponent', () => {
  let component: FilesTagsComponent;
  let fixture: ComponentFixture<FilesTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesTagsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
