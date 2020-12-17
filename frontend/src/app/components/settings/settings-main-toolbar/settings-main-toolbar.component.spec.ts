import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsMainToolbarComponent } from './settings-main-toolbar.component';

describe('SettingsMainToolbarComponent', () => {
  let component: SettingsMainToolbarComponent;
  let fixture: ComponentFixture<SettingsMainToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsMainToolbarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsMainToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
