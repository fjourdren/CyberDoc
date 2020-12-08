import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

export const AES_ALGORITHM = "aes-256-ctr";
export const AES_KEY_LENGTH = 16;

@Injectable()
export class AesService {
    constructor(private readonly configService: ConfigService) { }

    generateKey() {
        return randomBytes(AES_KEY_LENGTH).toString('hex');
    }

    encrypt(encryption_key: string, content: string | Buffer): string {
        const cipher = createCipheriv(AES_ALGORITHM, encryption_key, this.configService.get<string>("ENCRYPTION_IV"));
        const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
        return encrypted.toString('base64');
    }

    decrypt(encryption_key: string, content: string | Buffer): string {
        const toDecrypt = content.toString();
        const decipher = createDecipheriv(AES_ALGORITHM, encryption_key, this.configService.get<string>("ENCRYPTION_IV"));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(toDecrypt, 'base64')), decipher.final()]);
        return decrypted.toString('binary');
    }

}