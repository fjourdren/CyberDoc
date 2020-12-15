import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailUtilsService } from 'src/utils/mail-utils.service';
import { SharedWithPending } from 'src/schemas/file-sharewith-pending.schema';
import { File, FileDocument } from 'src/schemas/file.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { CryptoService } from 'src/crypto/crypto.service';

@Injectable()
export class FileSharingService {
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<FileDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly cryptoService: CryptoService,
    private readonly mailService: MailUtilsService,
    private readonly configService: ConfigService,
  ) {}

  async getSharedFiles(user: User): Promise<File[]> {
    return await this.fileModel.find({ sharedWith: user._id }).exec();
  }

  async getSharingAccesses(file: File) {
    const sharedUsersPending = file.shareWithPending.map((item) => item.email);
    const sharedUsers = await Promise.all(
      file.sharedWith.map(async (item) => {
        const user = await this.userModel.findOne({ _id: item });
        return {
          email: user.email,
          name: `${user.firstname} ${user.lastname}`,
        };
      }),
    );

    return { sharedUsersPending, sharedUsers };
  }

  async addAllPendingSharesForUser(user: User) {
    const pendingShareFiles = await this.fileModel
      .find({ 'sharedWithPending.email': user.email })
      .exec();
    for (const pendingShareFile of pendingShareFiles) {
      pendingShareFile.sharedWith.push(user._id);
      const fileAESKey = pendingShareFile.shareWithPending.find(
        (item) => item.email === user.email,
      ).file_aes_key;
      await this.cryptoService.addFileAESKeyToUser(
        user,
        pendingShareFile._id,
        fileAESKey,
      );

      pendingShareFile.shareWithPending = pendingShareFile.shareWithPending.filter(
        (item) => item.email !== user.email,
      );
      await new this.fileModel(pendingShareFile).save();
    }
  }

  async addSharingAccess(
    fileOwner: User,
    fileOwnerHash: string,
    email: string,
    file: File,
  ) {
    const user = await this.userModel.findOne({ email }).exec();
    const fileAESKey = this.cryptoService.getFileAESKey(
      fileOwner,
      fileOwnerHash,
      file._id,
    );

    if (user) {
      if (file.sharedWith.find((item) => item === email))
        throw new BadRequestException(
          'This user has already an access to this file',
        );
      await this.cryptoService.addFileAESKeyToUser(user, file._id, fileAESKey);

      file.sharedWith.push(user._id);
      await new this.fileModel(file).save();

      await this.mailService.send(
        email,
        this.configService.get<string>('SENDGRID_TEMPLATE_SHARED_WITH_YOU'),
        {
          file_owner_email: fileOwner.email,
          filename: file.name,
          url: `${this.configService.get<string>(
            'APP_FRONTEND_URL',
          )}/shared-with-me`,
        },
      );
    } else {
      if (file.shareWithPending.find((item) => item.email === email))
        throw new BadRequestException(
          'This user has already received an email to collaborate on this file',
        );

      const obj = new SharedWithPending();
      obj.email = email;
      obj.file_aes_key = fileAESKey;
      file.shareWithPending.push(obj);
      await new this.fileModel(file).save();

      await this.mailService.send(
        email,
        this.configService.get<string>('SENDGRID_TEMPLATE_SHARED_WITH_YOU'),
        {
          file_owner_email: fileOwner.email,
          filename: file.name,
          url: `${this.configService.get<string>(
            'APP_FRONTEND_URL',
          )}/register?data=${email};${fileOwner.email}`,
        },
      );
    }
  }

  async removeSharingAccess(fileOwner: User, email: string, file: File) {
    const user = await this.userModel.findOne({ email }).exec();
    if (user) {
      file.sharedWith = file.sharedWith.filter((item) => item !== user._id);
      await new this.fileModel(file).save();
      await this.cryptoService.removeFileAESKeyFromUser(user, file._id);
    } else {
    }
  }
}
