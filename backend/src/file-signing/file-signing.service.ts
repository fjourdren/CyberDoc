import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { CryptoService } from 'src/crypto/crypto.service';
import { RsaService } from 'src/crypto/rsa.service';
import { FilesService } from 'src/files/files.service';
import { File, FileDocument } from 'src/schemas/file.schema';
import { UserSign } from 'src/schemas/user-sign.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class FileSigningService {
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<FileDocument>,
    private readonly cryptoService: CryptoService,
    private readonly filesService: FilesService,
    private readonly rsa: RsaService,
  ) {}

  async addSign(
    mongoSession: ClientSession,
    user: User,
    userHash: string,
    file: File,
  ) {
    const userPrivateKey = await this.cryptoService.getUserPrivateKey(
      user,
      userHash,
    );
    const fileContent = await this.filesService.getFileContent(
      user,
      userHash,
      file,
    );

    const signObj = new UserSign();
    signObj.user_email = user.email;
    signObj.created_at = new Date(Date.now());

    const diggestBuffer = Buffer.from(
      `${signObj.user_email}${signObj.created_at}${fileContent}`,
    );
    signObj.diggest = this.rsa.sign(userPrivateKey, diggestBuffer);

    file.signs.push(signObj);
    await new this.fileModel(file).save({ session: mongoSession });
  }
}
