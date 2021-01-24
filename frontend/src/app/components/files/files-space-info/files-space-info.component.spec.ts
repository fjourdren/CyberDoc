import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesSpaceInfoComponent } from './files-space-info.component';

describe('FilesSpaceInfoComponent', () => {
  let component: FilesSpaceInfoComponent;
  let fixture: ComponentFixture<FilesSpaceInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesSpaceInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesSpaceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
