import { TestBed } from '@angular/core/testing';

import { RequireTwoFactorGuard } from './require-two-factor-guard.service';

describe('RequireTwoFactorGuard', () => {
  let guard: RequireTwoFactorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RequireTwoFactorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
