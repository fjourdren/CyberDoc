import { Test, TestingModule } from '@nestjs/testing';
import { FileSigningService } from './file-signing.service';

describe('FileSigningService', () => {
  let service: FileSigningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileSigningService],
    }).compile();

    service = module.get<FileSigningService>(FileSigningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
