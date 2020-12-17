import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesTagsInputComponent } from './files-tags-input.component';

describe('FilesTagsInputComponent', () => {
  let component: FilesTagsInputComponent;
  let fixture: ComponentFixture<FilesTagsInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesTagsInputComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesTagsInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
