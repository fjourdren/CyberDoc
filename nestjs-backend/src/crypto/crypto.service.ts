import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserFileKey } from 'src/schemas/user.schema';
import { AesService } from './aes.service';
import { RsaService } from './rsa.service';

@Injectable()
export class CryptoService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly aes: AesService,
        private readonly rsa: RsaService,
    ) { }

    async getUserPrivateKey(user: User, userHash: string) {
        return this.aes.decrypt(userHash, user.userKeys.encrypted_private_key);
    }

    async setUserPrivateKey(user: User, userHash: string, privateKey: string) {
        user.userKeys.encrypted_private_key = this.aes.encrypt(userHash, privateKey);
    }

    getFileAESKey(user: User, userHash: string, fileID: string): string | undefined {
        const encryptedAESKey = user.filesKeys.find(item => item.file_id === fileID)?.encryption_file_key;
        if (!encryptedAESKey) return null;

        const encryptedUserPrivateKey = user.userKeys.encrypted_private_key;
        const userPrivateKey = this.aes.decrypt(userHash, encryptedUserPrivateKey);

        return this.rsa.decrypt(userPrivateKey, encryptedAESKey);
    }

    async addFileAESKeyToUser(user: User, fileID: string, fileAESKey: string) {
        const encryptedAESKey = this.rsa.encrypt(user.userKeys.public_key, fileAESKey);
        const fileKey = new UserFileKey();
        fileKey.file_id = fileID;
        fileKey.encryption_file_key = encryptedAESKey;
        user.filesKeys.push(fileKey);
        await new this.userModel(user).updateOne(user);
    }

    async removeFileAESKeyFromUser(user: User, fileID: string) {
        user.filesKeys = user.filesKeys.filter(item => item.file_id !== fileID);
        await new this.userModel(user).updateOne(user);
    }

    async createAndGetFileAESKey(user: User, userHash: string, fileID: string): Promise<string> {
        if (this.getFileAESKey(user, userHash, fileID)) throw new InternalServerErrorException("File AES key already exists");
        const aesKey = this.aes.generateKey();
        await this.addFileAESKeyToUser(user, fileID, aesKey);
        return aesKey;
    }

    getKeysForFile(user: User, fileID: string): UserFileKey | undefined {
        return user.filesKeys.find(item => item.file_id === fileID);
    }

    async deleteAllAESKeysForFile(fileID: string): Promise<void> {
        await this.userModel.updateMany({}, { $pull: { "filesKeys": { "file_id": fileID } } }).exec();
    }
}
