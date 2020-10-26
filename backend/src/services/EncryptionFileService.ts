import IFile from "../models/File";
import IUser from "../models/User";


class EncryptionFileService {
    /** 
     * RSA to manage user permission to acess to a file 
    */
    // generate user's RSA keys
    public static async generateRSAKeys(user: IUser) {

    }

    // Get user's public encryption key
    public static async getPublicKey(user: IUser) {

    }

    // Encrypt User's private key (hashKey become the encryption key)
    public static async encryptUserPrivateKey(user: IUser, hashKey: string, private_key: string) {

    }

    // Change User's keys (decrypt and re-encrypt all user's File keys)
    public static async changeUserKeys(user: IUser, public_key: string, private_key: string) {

    }


    /** 
     * Encrypt / Decrypt a file with his AES encryption key
     * */
    // Encrypt File's AES key with user's public RSA key
    public static async encryptFileKeyWithUserPublicKey(user: IUser, file: IFile, file_aes_key: string) {

    }

    // Encrypt file's content
    public static async encryptFile(file: IFile, file_aes_key: string | undefined = undefined) {
        
    }

    // Decrypt file's content
    public static async decryptFile(file: IFile, aes_key: string) {
        
    }



    /** 
     * Manage sharing by getting file's AES and encrypt it with user's public RSA key 
     **/
    // Share a file with a new user
    public static async addFileKeyToUser(user: IUser, file: IFile, aes_key: string) {

    }

    // Unshare a file with a user
    public static async removeFileKeyFromUser(user: IUser, file: IFile) {

    }



    /**
     *  Delete a File
    */
    // Delete the keys from Users' spaces
    public static async deleteFileKeys(file: IFile) {

    }
}

export default EncryptionFileService;