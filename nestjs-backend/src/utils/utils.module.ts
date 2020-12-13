import { Module } from '@nestjs/common';
import { MailUtilsService } from './mail-utils.service';

@Module({
    providers: [MailUtilsService],
    exports: [MailUtilsService]
}) 
export class UtilsModule {}
