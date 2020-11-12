import { TestBed } from '@angular/core/testing';
import { RequireRecoveryKeyDownloadedGuard } from './require-recovery-key-downloaded.guard';

describe('RequireRecoveryKeyDownloadedGuard', () => {
  let guard: RequireRecoveryKeyDownloadedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RequireRecoveryKeyDownloadedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
