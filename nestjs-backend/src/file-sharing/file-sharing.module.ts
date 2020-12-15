import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CryptoModule } from 'src/crypto/crypto.module';
import { FilesModule } from 'src/files/files.module';
import { File, FileSchema } from 'src/schemas/file.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UtilsModule } from 'src/utils/utils.module';
import { FileSharingController } from './file-sharing.controller';
import { FileSharingService } from './file-sharing.service';

@Module({
  imports: [
    CryptoModule,
    FilesModule,
    UtilsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [FileSharingController],
  providers: [FileSharingService],
  exports: [FileSharingService]
})
export class FileSharingModule { }
