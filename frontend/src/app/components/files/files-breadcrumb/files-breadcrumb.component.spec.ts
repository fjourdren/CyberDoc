import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesBreadcrumbComponent } from './files-breadcrumb.component';

describe('FilesBreadcrumbComponent', () => {
  let component: FilesBreadcrumbComponent;
  let fixture: ComponentFixture<FilesBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesBreadcrumbComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
