import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@svtslv/nestjs-ioredis';

import * as Joi from '@hapi/joi';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { FilesModule } from './files/files.module';
import { CryptoModule } from './crypto/crypto.module';
import { FileTagsModule } from './file-tags/file-tags.module';
import { FileSharingModule } from './file-sharing/file-sharing.module';
import { UtilsModule } from './utils/utils.module';
import { FileSigningModule } from './file-signing/file-signing.module';
import { MongoSessionInterceptor } from './mongo-session.interceptor';
import { ErrorBanMiddleware } from './error-ban.middleware';
import { BillingModule } from './billing/billing.module';
import { JwtBanGuard } from './auth/jwt/jwt-ban.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      validationSchema: Joi.object({
        APP_NAME: Joi.string().required(),
        APP_PORT: Joi.number().required(),
        APP_VERSION: Joi.string().required(),
        CORS_ORIGIN: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.number().required(),
        JWT_COOKIE_NAME: Joi.string().required(),
        JWT_COOKIE_DOMAIN: Joi.string().required(),
        MONGODB_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        ENCRYPTION_IV: Joi.string().required(),

        DISABLE_2FA_AND_EMAIL: Joi.boolean().required(),
        SENDGRID_API_KEY: Joi.string().optional(),
        SENDGRID_MAIL_FROM: Joi.string().optional(),
        SENDGRID_MAIL_FROM_NAME: Joi.string().optional(),
        SENDGRID_TEMPLATE_FORGOTTEN_PASSWORD: Joi.string().optional(),
        SENDGRID_TEMPLATE_REQUEST_CREATE_ACCOUNT: Joi.string().optional(),
        SENDGRID_TEMPLATE_SHARED_WITH_YOU: Joi.string().optional(),
        SENDGRID_TEMPLATE_2FA_TOKEN: Joi.string().optional(),
        TWILIO_ACCOUNT_SID: Joi.string().optional(),
        TWILIO_AUTH_TOKEN: Joi.string().optional(),

        DISABLE_STRIPE: Joi.boolean().required(),
        STORAGE_SPACE: Joi.number().optional(), //used when stripe is disabled
        STRIPE_KEY: Joi.string().optional(),
        PLAN1_MONTH_STRIPEID: Joi.string().optional(),
        PLAN1_YEAR_STRIPEID: Joi.string().optional(),
        PLAN2_MONTH_STRIPEID: Joi.string().optional(),
        PLAN2_YEAR_STRIPEID: Joi.string().optional(),
        PLAN3_MONTH_STRIPEID: Joi.string().optional(),
        PLAN3_YEAR_STRIPEID: Joi.string().optional(),
        STRIPE_RETURN_URL: Joi.string().optional(),

        DISABLE_ETHERPAD: Joi.boolean().required(),
        ETHERPAD_ROOT_URL: Joi.string().optional(),
        ETHERPAD_ROOT_API_URL: Joi.string().optional(),
        ETHERPAD_API_KEY: Joi.string().optional(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        config: {
          url: configService.get<string>('REDIS_URL'),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    FileSharingModule,
    FilesModule,
    CryptoModule,
    FileTagsModule,
    UtilsModule,
    FileSigningModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtBanGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MongoSessionInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ErrorBanMiddleware).forRoutes('*');
  }
}
