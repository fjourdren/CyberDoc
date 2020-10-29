import { TestBed } from '@angular/core/testing';

import { TwoFactorGuard } from './two-factor-guard.service';

describe('TwoFactorGuard', () => {
  let guard: TwoFactorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(TwoFactorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
