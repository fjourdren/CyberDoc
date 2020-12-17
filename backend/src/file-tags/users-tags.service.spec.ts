import { Test, TestingModule } from '@nestjs/testing';
import { UsersTagsService } from './users-tags.service';

describe('UsersTagsService', () => {
  let service: UsersTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersTagsService],
    }).compile();

    service = module.get<UsersTagsService>(UsersTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
