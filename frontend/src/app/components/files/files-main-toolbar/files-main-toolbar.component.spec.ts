import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesMainToolbarComponent } from './files-main-toolbar.component';

describe('FilesMainToolbarComponent', () => {
  let component: FilesMainToolbarComponent;
  let fixture: ComponentFixture<FilesMainToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesMainToolbarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesMainToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
