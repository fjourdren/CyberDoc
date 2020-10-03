import { TestBed } from '@angular/core/testing';

import { FilesUtilsService } from './files-utils.service';

describe('FilesUtilsService', () => {
  let service: FilesUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilesUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
