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
import { JwtBanGuard } from './auth/jwt/jwt-ban.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
        SENDGRID_API_KEY: Joi.string().required(),
        SENDGRID_MAIL_FROM: Joi.string().required(),
        SENDGRID_MAIL_FROM_NAME: Joi.string().required(),
        SENDGRID_TEMPLATE_FORGOTTEN_PASSWORD: Joi.string().required(),
        SENDGRID_TEMPLATE_REQUEST_CREATE_ACCOUNT: Joi.string().required(),
        SENDGRID_TEMPLATE_SHARED_WITH_YOU: Joi.string().required(),
        SENDGRID_TEMPLATE_2FA_TOKEN: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        config: {
          url: configService.get('REDIS_URL'),
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
