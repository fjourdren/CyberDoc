import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilePreviewPageComponent } from './file-preview-page.component';

describe('FilePreviewPageComponent', () => {
  let component: FilePreviewPageComponent;
  let fixture: ComponentFixture<FilePreviewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilePreviewPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilePreviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
