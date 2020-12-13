import { Test, TestingModule } from '@nestjs/testing';
import { FileSigningController } from './file-signing.controller';

describe('FileSigningController', () => {
  let controller: FileSigningController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileSigningController],
    }).compile();

    controller = module.get<FileSigningController>(FileSigningController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
