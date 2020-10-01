import { TestBed } from '@angular/core/testing';

import { MimetypeUtilsService } from './mimetype-utils.service';

describe('MimetypeUtilsService', () => {
  let service: MimetypeUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MimetypeUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
