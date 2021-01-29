import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesPurgeDialogComponent } from './files-purge-dialog.component';

describe('FilesPurgeDialogComponent', () => {
  let component: FilesPurgeDialogComponent;
  let fixture: ComponentFixture<FilesPurgeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesPurgeDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesPurgeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
