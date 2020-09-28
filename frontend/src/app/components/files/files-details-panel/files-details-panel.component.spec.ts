import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDetailsPanelComponent } from './files-details-panel.component';

describe('FileDetailsPanelComponent', () => {
  let component: FileDetailsPanelComponent;
  let fixture: ComponentFixture<FileDetailsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileDetailsPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDetailsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
