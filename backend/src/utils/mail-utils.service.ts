import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  MailDataRequired,
  send as sgSend,
  setApiKey as sgSetApiKey,
} from '@sendgrid/mail';

@Injectable()
export class MailUtilsService {
  private readonly emailDisabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.emailDisabled = configService.get<boolean>('DISABLE_2FA_AND_EMAIL');

    if (!this.emailDisabled) {
      const requiredEnvVars = [
        'SENDGRID_API_KEY',
        'SENDGRID_MAIL_FROM',
        'SENDGRID_MAIL_FROM_NAME',
        'SENDGRID_TEMPLATE_FORGOTTEN_PASSWORD',
        'SENDGRID_TEMPLATE_REQUEST_CREATE_ACCOUNT',
        'SENDGRID_TEMPLATE_SHARED_WITH_YOU',
        'SENDGRID_TEMPLATE_2FA_TOKEN',
      ];

      for (const requiredEnvVar of requiredEnvVars) {
        if (!configService.get<string>(requiredEnvVar)) {
          throw new InternalServerErrorException(
            `Missing ${requiredEnvVar} envvar`,
          );
        }
      }

      sgSetApiKey(configService.get<string>('SENDGRID_API_KEY'));
    }
  }

  async send(email: string, templateID: string, templateParams: any) {
    if (this.emailDisabled) return;

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
