import { Module } from '@nestjs/common';
import { AesService } from './aes.service';
import { RsaService } from './rsa.service';
import { UserHashService } from './user-hash.service';
import { CryptoService } from './crypto.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    providers: [AesService, RsaService, UserHashService, CryptoService],
    exports: [AesService, RsaService, UserHashService, CryptoService]
})
export class CryptoModule { }
