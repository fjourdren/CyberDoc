import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesDetailsPanelComponent } from './files-details-panel.component';

describe('FileDetailsPanelComponent', () => {
  let component: FilesDetailsPanelComponent;
  let fixture: ComponentFixture<FilesDetailsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesDetailsPanelComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesDetailsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
