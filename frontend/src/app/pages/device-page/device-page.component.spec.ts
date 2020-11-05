import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePageComponent } from './device-page.component';

describe('DevicePageComponent', () => {
  let component: DevicePageComponent;
  let fixture: ComponentFixture<DevicePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DevicePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
