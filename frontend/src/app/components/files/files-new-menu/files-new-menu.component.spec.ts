import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesNewMenuComponent } from './files-new-menu.component';

describe('FilesNewMenuComponent', () => {
  let component: FilesNewMenuComponent;
  let fixture: ComponentFixture<FilesNewMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesNewMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesNewMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
