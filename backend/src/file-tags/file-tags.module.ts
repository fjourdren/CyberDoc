import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesModule } from 'src/files/files.module';
import { File, FileSchema } from 'src/schemas/file.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UsersModule } from 'src/users/users.module';
import { FilesTagsController } from './files-tags.controller';
import { FilesTagsService } from './files-tags.service';
import { UsersTagsController } from './users-tags.controller';
import { UsersTagsService } from './users-tags.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    UsersModule,
    FilesModule,
  ],
  providers: [FilesTagsService, UsersTagsService],
  exports: [FilesTagsService, UsersTagsService],
  controllers: [FilesTagsController, UsersTagsController],
})
export class FileTagsModule {}
