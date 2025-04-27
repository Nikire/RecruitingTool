import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

const { PORT, FRONTEND_URL } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Recruiting Tool API')
    .setDescription('API for managing recruitment processes, user roles and more.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(PORT ?? 4000);
}
bootstrap();
