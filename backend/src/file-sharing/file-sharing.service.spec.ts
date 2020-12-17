import { Test, TestingModule } from '@nestjs/testing';
import { FileSharingService } from './file-sharing.service';

describe('FileSharingService', () => {
  let service: FileSharingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileSharingService],
    }).compile();

    service = module.get<FileSharingService>(FileSharingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
