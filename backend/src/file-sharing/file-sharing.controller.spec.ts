import { Test, TestingModule } from '@nestjs/testing';
import { FileSharingController } from './file-sharing.controller';

describe('FileSharingController', () => {
  let controller: FileSharingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileSharingController],
    }).compile();

    controller = module.get<FileSharingController>(FileSharingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
