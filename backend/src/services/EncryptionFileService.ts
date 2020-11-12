import NodeRSA from 'node-rsa';

import CryptoHelper from "../helpers/CryptoHelper";
import { requireNonNull } from '../helpers/DataValidation';
import HttpCodes from '../helpers/HttpCodes';
import HTTPError from '../helpers/HTTPError';
import IFile from "../models/File";
import IFileEncryptionKeys, { FileEncryptionKeys } from '../models/FileEncryptionKeys';
import IUser, { User } from "../models/User";
import { streamToBuffer } from '../helpers/Conversions';
import { Readable } from 'stream';

class EncryptionFileService {
    /**
     * generate user key
     */
    public static generateUserSha(email: string, password: string): string {
        return CryptoHelper.sha3(email + password);
    }
    

    /** 
     * RSA to manage user permission to acess to a file 
    */
    // Encrypt & save User's private key (hashKey become the encryption key)
    public static async encryptAndSaveUserPrivateKey(user: IUser, user_key: string, private_key: string) {
        const encrypted_private_key: string = CryptoHelper.encryptAES(user_key, private_key);
        user.userKeys.encrypted_private_key = encrypted_private_key;
        return await user.save();
    }

    // Get user's public encryption key
    public static async getPublicKey(email: string): Promise<NodeRSA> {
        const user: any = requireNonNull(await User.findOne({ "email": email }).exec(), HttpCodes.NOT_FOUND, "This user doesn't exist");
        const user_key_obj: NodeRSA = new NodeRSA();
        return user_key_obj.importKey(user.userKeys.public_key, "public");
    }

    // Encrypt User's private key (hashKey become the encryption key)
    public static async getPrivateKey(user: IUser, user_hash: string): Promise<NodeRSA> {
        const updated_user: any = requireNonNull(await User.findById(user._id).exec(), HttpCodes.NOT_FOUND, "This user doesn't exist");
        const user_privateKey: string = CryptoHelper.decryptAES(user_hash, updated_user.userKeys.encrypted_private_key);

        const user_key_obj: NodeRSA = new NodeRSA();
        return user_key_obj.importKey(user_privateKey, "private");
    }


    /** 
     * Encrypt / Decrypt a file with his AES encryption key
     * */
    // get file's aes_key
    public static async getFileKey(user: IUser, file: IFile, user_hash: string): Promise<string> {
        const fromDb: IUser = requireNonNull(await User.findOne({'_id': user._id}).exec());

        // search the good key in the user's keys array
        let user_file_key_object: IFileEncryptionKeys | undefined;
        for await (let inTest of fromDb.filesKeys) {
            if(file._id == inTest.file_id) {
                user_file_key_object = inTest;
                break;
            }
        }

        // check if a key has been found
        if(user_file_key_object == undefined)
            throw new HTTPError(HttpCodes.NOT_FOUND, "File not found")
        
        // get user private key
        const user_privateKey: NodeRSA = await EncryptionFileService.getPrivateKey(user, user_hash);

        return CryptoHelper.decryptRSA(user_privateKey, user_file_key_object.encryption_file_key);
    }
 
    // Encrypt file's content
    public static encryptFileContent(file_content: string | Buffer, file_aes_key: string | undefined = undefined): Record<any, any> {
        // if file have no aes key, we generate one
        if(file_aes_key == undefined) {
            file_aes_key = CryptoHelper.generateAES();
        }

        // encrypt file content
        const encrypted_file_content: string = CryptoHelper.encryptAES(file_aes_key, file_content);

        return { "aes_key": file_aes_key, "content": encrypted_file_content };
    }

    // Decrypt file's content
    public static async decryptFileContent(user_hash: string, user: IUser, file: IFile, content: Readable): Promise<string> {
        const buffer: Buffer = await streamToBuffer(content); // used to rebuild document from a stream of chunk

        // decrypt content
        const aes_file_key: string = await EncryptionFileService.getFileKey(user, file, user_hash);
        const decrypt_content: string = CryptoHelper.decryptAES(aes_file_key, buffer);

        return decrypt_content;
    }



    /**
     * Get all users who has an access to that file
     */
    public static async getUsersWithAccess(file: IFile): Promise<IUser[]> {
        return await User.find({ 'filesKeys': { $elemMatch: { file_id: file._id } } }).exec();
    }


    /** 
     * Manage sharing by getting file's AES and encrypt it with user's public RSA key 
     **/
    // Share a file with a new user
    public static async addFileKeyToUser(user: IUser, file: IFile, file_aes_key: string) {
        // encrypt file's AES with user's public key
        const user_public_key: NodeRSA = await EncryptionFileService.getPublicKey(user.email);

        const encrypted_file_key: string = CryptoHelper.encryptRSA(user_public_key, file_aes_key);

        // check that the user doesn't already have the key
        const key_object: IFileEncryptionKeys = new FileEncryptionKeys();
        key_object.file_id = file._id;
        key_object.encryption_file_key = encrypted_file_key;

        const user_filesKeys: IFileEncryptionKeys[] = user.filesKeys;
        for(let i = 0; i < user_filesKeys.length; i++)
            if(user_filesKeys[i].file_id == file._id)
                throw new HTTPError(HttpCodes.BAD_REQUEST, "The user already has an encryption key for that file")
    
        // add to user's key list
        let temp = user.filesKeys;
        temp.push(key_object);

        // update tag list
        return requireNonNull(await User.updateOne({ _id: user._id }, {$set: {filesKeys: temp }}).exec());
    }

    // Unshare a file with a user
    public static async removeFileKeyFromUser(user: IUser, file: IFile) {
        return requireNonNull(await User.updateOne( {'_id': user._id }, { $pull: { "filesKeys": { "file_id": file._id }} }).exec(), HttpCodes.BAD_REQUEST, "The user doesn't have access to this file");
    }



    /**
     *  Delete a File
    */
    // Delete the keys from Users' spaces
    public static async deleteFileKeys(file: IFile) {
        return await User.updateMany( {}, { $pull: { "filesKeys": { "file_id": file._id }} }).exec();
    }
}

export default EncryptionFileService;