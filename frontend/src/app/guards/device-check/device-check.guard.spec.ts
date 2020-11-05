import { TestBed } from '@angular/core/testing';

import { DeviceCheckGuard } from './device-check.guard';

describe('DeviceCheckGuard', () => {
  let guard: DeviceCheckGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DeviceCheckGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
