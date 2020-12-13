import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesModule } from 'src/files/files.module';
import { File, FileSchema } from 'src/schemas/file.schema';
import { UsersModule } from 'src/users/users.module';
import { UtilsModule } from 'src/utils/utils.module';
import { FileSharingController } from './file-sharing.controller';
import { FileSharingService } from './file-sharing.service';

@Module({
  imports: [
    UsersModule,
    FilesModule,
    UtilsModule,
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [FileSharingController],
  providers: [FileSharingService]
})
export class FileSharingModule {}
