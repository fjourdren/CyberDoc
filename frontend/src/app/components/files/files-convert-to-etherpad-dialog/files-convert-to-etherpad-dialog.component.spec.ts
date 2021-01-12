import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesConvertToEtherpadDialogComponent } from './files-convert-to-etherpad-dialog.component';

describe('FilesConvertToEtherpadDialogComponent', () => {
  let component: FilesConvertToEtherpadDialogComponent;
  let fixture: ComponentFixture<FilesConvertToEtherpadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesConvertToEtherpadDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesConvertToEtherpadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
