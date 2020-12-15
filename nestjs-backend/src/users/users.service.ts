import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

export const COLUMNS_TO_KEEP_FOR_USER = ["_id", "firstname", "lastname", "email", "directory_id", "tags"];

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly filesService: FilesService,
        private readonly fileSharingService: FileSharingService,
        private readonly cryptoService: CryptoService,
        private readonly rsa: RsaService,
        private readonly authService: AuthService,
        private readonly userHashService: UserHashService
    ) { }

    async prepareUserForOutput(user: User): Promise<UserInResponse> {
        const result = COLUMNS_TO_KEEP_FOR_USER.reduce((r, key) => {
            r[key] = user[key];
            return r;
        }, {});
        return result as UserInResponse;
    }

    async findOneByEmail(email: string): Promise<User | undefined> {
        return this.userModel.findOne({ email }).exec();
    }

    async findOneByID(id: string): Promise<User | undefined> {
        return this.userModel.findOne({ _id: id }).exec();
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        if (await this.findOneByEmail(createUserDto.email)) {
            throw new ConflictException("Another account with this mail already exists");
        }

        const user = new User();
        const userHash = this.userHashService.generateUserHash(createUserDto.email, createUserDto.password);
        const userKeys = new UserKeys();

        user._id = uuidv4();
        user.email = createUserDto.email;
        user.filesKeys = [];
        user.firstname = createUserDto.firstname;
        user.lastname = createUserDto.lastname;
        user.password = await this.authService.hashPassword(createUserDto.password);
        user.tags = [];
        user.userKeys = userKeys;

        const { rsaPublicKey, rsaPrivateKey } = this.rsa.generateKeys();
        userKeys.public_key = rsaPublicKey;
        await this.cryptoService.setUserPrivateKey(user, userHash, rsaPrivateKey);

        const rootFolder = await this.filesService.create(user, "My safebox", "application/x-dir", null);
        user.directory_id = rootFolder._id;

        await this.fileSharingService.addAllPendingSharesForUser(user);
        return await new this.userModel(user).save();
    }

    async editUserEmailAndPassword(user: User, userHash: string, newEmail: string, newPassword: string): Promise<{ user: User, newAccessToken: string }> {
        const newCryptedPassword = await this.authService.hashPassword(newPassword);
        const newUserHash = this.userHashService.generateUserHash(newEmail, newPassword);
        const userPrivateKey = await this.cryptoService.getUserPrivateKey(user, userHash);

        await this.cryptoService.setUserPrivateKey(user, newUserHash, userPrivateKey);
        user.email = newEmail;
        user.password = newCryptedPassword;

        return {
            user: await new this.userModel(user).save(),
            newAccessToken: this.authService.generateJWTToken(user._id, newUserHash),
        }
    }

    async editUserBasicMetadata(user: User, newFirstName: string, newLastName: string): Promise<User> {
        user.firstname = newFirstName;
        user.lastname = newLastName;
        return await new this.userModel(user).save();
    }

    async deleteUser(user: User): Promise<void> {
        const rootFolder = await this.filesService.findOne(user.directory_id);
        await this.filesService.delete(rootFolder);
        await new this.userModel(user).deleteOne()
    }

    async exportData(user: User): Promise<{
        user: UserInResponse,
        files: FileInResponse[]
    }> {
        const rawFiles = await this.filesService.getAllFilesForUser(user._id);
        const files = await Promise.all(rawFiles.map(async item => {
            return await this.filesService.prepareFileForOutput(item);
        }));

        return {
            user: await this.prepareUserForOutput(user),
            files
        }
    }
}