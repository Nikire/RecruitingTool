import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { PlanLimitsService } from './modules/plan-limits/plan-limits.service';
import { FeatureFlagsService } from './modules/feature-flags/feature-flags.service';

const { PORT, FRONTEND_URL } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for webhook signature verification
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Register global exception filters for consistent error handling
  // Order matters: Prisma filter should be registered first to catch Prisma-specific errors
  app.useGlobalFilters(new PrismaExceptionFilter(), new HttpExceptionFilter());

  // Register global response interceptor for consistent success responses
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.enableCors({
    origin: FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('BorderLess API')
    .setDescription('API for managing recruitment processes, user roles and more by EMP Employment Solutions.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory);

  // Seed default plan limits into the database if the table is empty.
  // This is idempotent — safe to call on every bootstrap.
  const planLimitsService = app.get(PlanLimitsService);
  await planLimitsService.seedDefaults();

  // Seed default feature flags into the database if the table is empty.
  // This is idempotent — safe to call on every bootstrap.
  const featureFlagsService = app.get(FeatureFlagsService);
  await featureFlagsService.seedDefaults();

  await app.listen(PORT ?? 4000);
}
bootstrap();
