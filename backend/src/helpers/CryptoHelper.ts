import { SHA3 } from 'sha3';
import nodeRSA, { Encoding } from 'node-rsa';
import crypto from 'crypto';
import NodeRSA from 'node-rsa';

const DEFAULT_KEY_LENGTH: 512 | 224 | 256 | 384 = 512;
const AES_DEFAULT_KEY_LENGTH: 16 | 24 | 32 = 16;

class CryptoHelper {
    // cut the AES_DEFAULT_KEY_LENGTH first chars of an user_hash
    // AES algorithm needs to have a 32 chars key so we cut the 32 first chars of the user_hash param to be able to use it as an AES key to encrypt/decrypt
    public static prepareUser_hash(user_hash: string): string {
        return user_hash?.substring(0, AES_DEFAULT_KEY_LENGTH * 2); // *2 to get 32 caracters and not 16 bytes
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

    public static encryptRSA(key: nodeRSA, content: string | Buffer): string {
        return key.encrypt(content, 'base64');

    }

    public static decryptRSA(key: nodeRSA, encrypted_content: string): string {
        return key.decrypt(encrypted_content, 'binary');
    }


    // rsa sign
    public static signBuffer(private_key: NodeRSA, diggest_buffer: Buffer, encoding: Encoding, source_encoding: Encoding): string {
        return private_key.sign(diggest_buffer, encoding, source_encoding);
    }

    // verify sign
    public static verifySignBuffer(public_key: NodeRSA, content_buffer: Buffer, diggest: string, source_encoding: Encoding, signature_encoding: Encoding): Boolean {
        return public_key.verify(content_buffer, diggest, source_encoding, signature_encoding);
    }



    // AES encryption
    public static generateAES(key_size: 16 | 24 | 32 = AES_DEFAULT_KEY_LENGTH): string {
        return crypto.randomBytes(key_size).toString('hex');
    }

    public static encryptAES(encryption_key: string, content: string | Buffer): string {
        // select encryption algo
        const algorithm = 'aes-256-ctr';

        // create cipher
        const cipher = crypto.createCipheriv(algorithm, encryption_key, process.env.ENCRYPTION_IV);

        // encrypt
        const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);

        // convert and return
        return encrypted.toString('base64');
    }

    public static decryptAES(encryption_key: string, content: string | Buffer): string {
        // select encryption algo
        const algorithm = 'aes-256-ctr';

        // cut the encryption to get back iv value
        const toDecrypt = content.toString();

        // create cypher
        const decipher = crypto.createDecipheriv(algorithm, encryption_key, process.env.ENCRYPTION_IV);

        // decrypt
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(toDecrypt, 'base64')), decipher.final()]);

        // convert and return
        return decrpyted.toString('binary');
    }
}

export default CryptoHelper;