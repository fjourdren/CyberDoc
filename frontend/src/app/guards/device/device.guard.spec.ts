import { TestBed } from '@angular/core/testing';

import { DeviceGuard } from './device.guard';

describe('DeviceGuard', () => {
  let guard: DeviceGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DeviceGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
