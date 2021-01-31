import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { UserHashService } from 'src/crypto/user-hash.service';
import { FileInResponse } from 'src/files/files.controller.types';
import { FilesService } from 'src/files/files.service';
import { User, UserDocument, UserKeys } from 'src/schemas/user.schema';
import { UserInResponse } from './users.controller.types';
import { CryptoService } from 'src/crypto/crypto.service';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RsaService } from 'src/crypto/rsa.service';
import { v4 as uuidv4 } from 'uuid';
import { FileSharingService } from 'src/file-sharing/file-sharing.service';
import { EditUserDto } from './dto/edit-user.dto';
import { BillingService } from '../billing/billing.service';
import { UserDevice } from '../schemas/user-device.schema';

export const COLUMNS_TO_KEEP_FOR_USER = [
  '_id',
  'firstname',
  'lastname',
  'email',
  'directory_id',
  'tags',
  'twoFactorApp',
  'twoFactorEmail',
  'twoFactorSms',
  'role',
  'theme',
];

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly filesService: FilesService,
    private readonly fileSharingService: FileSharingService,
    private readonly cryptoService: CryptoService,
    private readonly rsa: RsaService,
    private readonly authService: AuthService,
    private readonly userHashService: UserHashService,
    private readonly billingService: BillingService,
  ) {}

  async prepareUserForOutput(user: User): Promise<UserInResponse> {
    const result: any = COLUMNS_TO_KEEP_FOR_USER.reduce((r, key) => {
      r[key] = user[key];
      return r;
    }, {});

    const subscription = await this.billingService.getSubscription(
      user.billingAccountID,
    );

    result.subscription = subscription;
    result.usedSpace = await this.filesService.getUsedSpace(user);
    result.availableSpace = this.billingService.getAvailableSpaceForSubscription(
      subscription,
    );

    return result as UserInResponse;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneByID(id: string): Promise<User | undefined> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  async createUser(
    mongoSession: ClientSession,
    currentDevice: UserDevice,
    createUserDto: CreateUserDto,
  ): Promise<User> {
    if (await this.findOneByEmail(createUserDto.email)) {
      throw new ConflictException(
        'Another account with this mail already exists',
      );
    }

    const user = new User();
    const userHash = this.userHashService.generateUserHash(
      createUserDto.email,
      createUserDto.password,
    );
    const userKeys = new UserKeys();

    user._id = uuidv4();
    user.email = createUserDto.email;
    user.role = createUserDto.role;
    user.filesKeys = [];
    user.firstname = createUserDto.firstname;
    user.lastname = createUserDto.lastname;
    user.password = await this.authService.hashPassword(createUserDto.password);
    user.tags = [];
    user.twoFactorApp = false;
    user.twoFactorSms = false;
    user.twoFactorEmail = false;
    user.userKeys = userKeys;
    user.theme = 'indigo-pink';
    user.billingAccountID = await this.billingService.createBillingAccount();

    const { rsaPublicKey, rsaPrivateKey } = this.rsa.generateKeys();
    userKeys.public_key = rsaPublicKey;
    await this.cryptoService.setUserPrivateKey(user, userHash, rsaPrivateKey);

    const rootFolder = await this.filesService.create(
      mongoSession,
      user,
      currentDevice,
      'My safebox',
      'application/x-dir',
      null,
      true /* __allowNullFolderID */,
    );
    user.directory_id = rootFolder._id;

    await this.fileSharingService.addAllPendingSharesForUser(
      mongoSession,
      user,
    );
    return await new this.userModel(user).save({ session: mongoSession });
  }

  async editProfile(
    mongoSession: ClientSession,
    user: User,
    editUserDto: EditUserDto,
  ) {
    user.firstname = editUserDto.firstname || user.firstname;
    user.lastname = editUserDto.lastname || user.lastname;
    user.theme = editUserDto.theme || user.theme;
    user.phoneNumber = editUserDto.phoneNumber || user.phoneNumber;

    const emailChanged = editUserDto.email && editUserDto.email !== user.email;
    const passwordChanged = !(await this.authService.isValidPassword(
      user,
      editUserDto.newPassword,
    ));
    if (emailChanged || passwordChanged) {
      if (
        !(await this.authService.isValidPassword(
          user,
          editUserDto.currentPassword,
        ))
      ) {
        throw new ForbiddenException('Missing or wrong password specified');
      }
      user.email = editUserDto.email || user.email;
      user.password = editUserDto.newPassword
        ? await this.authService.hashPassword(editUserDto.newPassword)
        : user.password;
    }

    return await new this.userModel(user).save({ session: mongoSession });
  }

  async deleteUser(user: User): Promise<void> {
    await this.billingService.deleteBillingAccount(user.billingAccountID);
    const rootFolder = await this.filesService.findOne(user.directory_id);
    await this.filesService.delete(rootFolder);

    //cforgeard 17/12/20 deleteOne don't support sessions...
    await new this.userModel(user).deleteOne();
  }

  async exportData(
    user: User,
  ): Promise<{
    user: UserInResponse;
    files: FileInResponse[];
  }> {
    const rawFiles = await this.filesService.getAllFilesForUser(user._id);
    const files = await Promise.all(
      rawFiles.map(async (item) => {
        return await this.filesService.prepareFileForOutput(item);
      }),
    );

    return {
      user: await this.prepareUserForOutput(user),
      files,
    };
  }
}
