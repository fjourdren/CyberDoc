import { Injectable } from '@nestjs/common';
import { SHA3 } from 'sha3';
import { AES_KEY_LENGTH } from './aes.service';
import { RSA_KEY_LENGTH } from './rsa.service';

@Injectable()
export class UserHashService {
  constructor() {}

  generateUserHash(email: string, password: string) {
    const hashObj = new SHA3(RSA_KEY_LENGTH);
    hashObj.update(`${email}${password}`);
    const hash = hashObj.digest('hex');
    return hash.substring(0, AES_KEY_LENGTH * 2);
  }
}
