import { SHA3 } from 'sha3';
import nodeRSA from 'node-rsa';
import aesjs from 'aes-js';
import crypto from 'crypto';

const DEFAULT_KEY_LENGTH: 512 | 224 | 256 | 384 = 512;
const AES_DEFAULT_KEY_LENGTH: 16 | 24 | 32 = 32;

class CryptoHelper {
    // cut the AES_DEFAULT_KEY_LENGTH first chars of an user_hash
    // AES algorithm needs to have a 32 chars key so we cut the 32 first chars of the user_hash param to be able to use it as an AES key to encrypt/decrypt
    public static prepareUser_hash(user_hash: string): string {
        return user_hash.substring(0, AES_DEFAULT_KEY_LENGTH);
    }

    // sha3 hashing
    public static sha3(content: string, key_size: 512 | 224 | 256 | 384 = DEFAULT_KEY_LENGTH): string {
        const hash = new SHA3(key_size);
 
        hash.update(content);
        return hash.digest('hex');
    }



    // RSA encryption
    public static generateRSAKeys(key_size: number = DEFAULT_KEY_LENGTH): nodeRSA {
        return new nodeRSA({b: key_size});
    }

    public static encryptRSA(key: nodeRSA, content: string): string {
        return key.encrypt(content, 'base64');

    }

    public static decryptRSA(key: nodeRSA, encrypted_content: string): string {
        return key.decrypt(encrypted_content, 'utf8');
    }



    // AES encryption
    public static generateAES(key_size: 16 | 24 | 32 = AES_DEFAULT_KEY_LENGTH): string {
        return crypto.randomBytes(key_size).toString('hex');
    }

    public static encryptAES(encryption_key: string, content: string): string {
        // byte conversion
        const key: Uint8Array = aesjs.utils.hex.toBytes(encryption_key);
        const textBytes = aesjs.utils.utf8.toBytes(content);

        // encryption
        const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        const encryptedBytes = aesCtr.encrypt(textBytes);

        // convert to string
        return aesjs.utils.hex.fromBytes(encryptedBytes);
    }

    public static decryptAES(encryption_key: string, content: string): string {
        // byte conversion
        const key: Uint8Array = aesjs.utils.hex.toBytes(encryption_key);
        const encryptedBytes = aesjs.utils.hex.toBytes(content);
        
        // encryption
        var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        var decryptedBytes = aesCtr.decrypt(encryptedBytes);
        
        // convert to string
        return aesjs.utils.utf8.fromBytes(decryptedBytes);
    }
}

export default CryptoHelper;