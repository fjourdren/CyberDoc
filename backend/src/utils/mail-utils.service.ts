import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  MailDataRequired,
  send as sgSend,
  setApiKey as sgSetApiKey,
} from '@sendgrid/mail';

@Injectable()
export class MailUtilsService {
  constructor(private readonly configService: ConfigService) {
    sgSetApiKey(configService.get<string>('SENDGRID_API_KEY'));
  }

  async send(email: string, templateID: string, templateParams: any) {
    const msg: MailDataRequired = {
      to: email,
      from: {
        email: this.configService.get<string>('SENDGRID_MAIL_FROM'),
        name: this.configService.get<string>('SENDGRID_MAIL_FROM_NAME'),
      },
      templateId: templateID,
      dynamicTemplateData: templateParams,
    };
    await sgSend(msg);
  }
}
