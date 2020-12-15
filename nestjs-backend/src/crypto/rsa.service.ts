import { Injectable } from "@nestjs/common";
import * as NodeRSA from 'node-rsa'

export const RSA_KEY_LENGTH = 512;

@Injectable()
export class RsaService {

    constructor() { }

    generateKeys() {
        const keyObject = new NodeRSA({ b: RSA_KEY_LENGTH });
        return {
            rsaPublicKey: keyObject.exportKey("public"),
            rsaPrivateKey: keyObject.exportKey("private")
        }
    }

    encrypt(key: string, content: string | Buffer): string {
        const keyObject = new NodeRSA();
        keyObject.importKey(key, "public");
        return keyObject.encrypt(content, 'base64');
    }

    decrypt(key: string, encrypted_content: string): string {
        const keyObject = new NodeRSA();
        keyObject.importKey(key, "private");
        return keyObject.decrypt(encrypted_content, 'binary');
    }

    sign(privateKey: string, buffer: Buffer) {
        const keyObject = new NodeRSA();
        keyObject.importKey(privateKey, "private");
        return keyObject.sign(buffer, "base64", "binary");
    }

}