import { Test, TestingModule } from '@nestjs/testing';
import { UsersTagsController } from './users-tags.controller';

describe('UsersTagsController', () => {
  let controller: UsersTagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersTagsController],
    }).compile();

    controller = module.get<UsersTagsController>(UsersTagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
