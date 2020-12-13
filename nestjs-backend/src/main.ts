import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GenericResponseInterceptor } from './generic-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('CyberDoc API')
    .setDescription('CyberDoc API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  //enable data validation in DTO classes
  app.useGlobalPipes(new ValidationPipe());
  
  app.useGlobalInterceptors(new GenericResponseInterceptor());
  await app.listen(3200);
}
bootstrap();
