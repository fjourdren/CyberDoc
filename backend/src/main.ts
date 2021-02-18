import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GenericResponseInterceptor } from './generic-response.interceptor';
import * as helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './global-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // see https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', 1);

  const config = new ConfigService();
  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalFilters(new GlobalExceptionFilter(config, httpAdapter));

  /*const options = new DocumentBuilder()
    .setTitle(config.get<string>('APP_NAME'))
    .setDescription(config.get<string>('APP_NAME'))
    .setVersion(config.get<string>('APP_VERSION'))
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);*/

  //enable data validation in DTO classes
  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalInterceptors(new GenericResponseInterceptor());

  //Helmet helps you secure your Express apps by setting various HTTP headers
  //https://github.com/helmetjs/helmet#how-it-works
  app.use(helmet());

  app.use(cookieParser());

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN').split(','),
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  
  await app.listen(config.get<number>('APP_PORT'));
}
// noinspection JSIgnoredPromiseFromCall
bootstrap();
