import { TestBed } from '@angular/core/testing';

import { AppUtilsService } from './app-utils.service';

describe('AppUtilsService', () => {
  let service: AppUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
