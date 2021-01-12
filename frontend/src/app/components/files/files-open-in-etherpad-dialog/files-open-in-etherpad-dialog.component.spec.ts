import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesOpenInEtherpadDialogComponent } from './files-open-in-etherpad-dialog.component';

describe('FilesOpenInEtherpadDialogComponent', () => {
  let component: FilesOpenInEtherpadDialogComponent;
  let fixture: ComponentFixture<FilesOpenInEtherpadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesOpenInEtherpadDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesOpenInEtherpadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
