import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GenericResponseInterceptor } from './generic-response.interceptor';
import * as helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

const FRONTEND_ORIGIN = 'http://localhost:4200';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('CyberDoc API')
    .setDescription('CyberDoc API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  //enable data validation in DTO classes
  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalInterceptors(new GenericResponseInterceptor());

  //Helmet helps you secure your Express apps by setting various HTTP headers
  //https://github.com/helmetjs/helmet#how-it-works
  app.use(helmet());

  app.use(cookieParser());

  app.enableCors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  await app.listen(3200);
}
bootstrap();
