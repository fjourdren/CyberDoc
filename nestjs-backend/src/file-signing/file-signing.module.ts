import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CryptoModule } from 'src/crypto/crypto.module';
import { FilesModule } from 'src/files/files.module';
import { FileSchema, File } from 'src/schemas/file.schema';
import { UsersModule } from 'src/users/users.module';
import { FileSigningController } from './file-signing.controller';
import { FileSigningService } from './file-signing.service';

@Module({
  imports: [
    UsersModule,
    FilesModule,
    CryptoModule,
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [FileSigningController],
  providers: [FileSigningService]
})
export class FileSigningModule {}
