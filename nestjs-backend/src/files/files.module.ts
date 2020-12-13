import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from '../schemas/file.schema';
import { UsersModule } from 'src/users/users.module';
import { CryptoModule } from 'src/crypto/crypto.module';
import { PreviewGenerator } from './file-preview/preview-generator.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    UsersModule,
    CryptoModule
  ],
  exports: [
    FilesService
  ],
  providers: [FilesService, PreviewGenerator],
  controllers: [FilesController]
})
export class FilesModule {}
