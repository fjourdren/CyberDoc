import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from '../schemas/file.schema';
import { CryptoModule } from 'src/crypto/crypto.module';
import { PreviewGenerator } from './file-preview/preview-generator.service';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    CryptoModule
  ],
  exports: [
    FilesService
  ],
  providers: [FilesService, PreviewGenerator],
  controllers: [FilesController]
})
export class FilesModule {}
