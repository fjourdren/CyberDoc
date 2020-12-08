import { Module } from '@nestjs/common';
import { AesService } from './aes.service';
import { RsaService } from './rsa.service';
import { UserHashService } from './user-hash.service';

@Module({
    providers: [AesService, RsaService, UserHashService],
    exports: [AesService, RsaService, UserHashService]
}) 
export class CryptoModule { }
