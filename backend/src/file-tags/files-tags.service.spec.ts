import { Test, TestingModule } from '@nestjs/testing';
import { FilesTagsService } from './files-tags.service';

describe('FilesTagsService', () => {
  let service: FilesTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesTagsService],
    }).compile();

    service = module.get<FilesTagsService>(FilesTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
