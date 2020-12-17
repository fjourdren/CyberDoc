import { Test, TestingModule } from '@nestjs/testing';
import { FilesTagsController } from './files-tags.controller';

describe('FilesTagsController', () => {
  let controller: FilesTagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesTagsController],
    }).compile();

    controller = module.get<FilesTagsController>(FilesTagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
