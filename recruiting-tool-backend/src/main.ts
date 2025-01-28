import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const { PORT } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Recruiting Tool API')
    .setDescription('API for managing recruitment processes')
    .setVersion('1.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      include: [], // Include specific modules for Swagger documentation
    });

  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(PORT ?? 4000);
}
bootstrap();
