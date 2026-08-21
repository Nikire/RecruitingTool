import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { PlanLimitsService } from './modules/plan-limits/plan-limits.service';
import { FeatureFlagsService } from './modules/feature-flags/feature-flags.service';
import { PublicApiModule } from './public-api/public-api.module';
import { initSentry } from './common/filters/sentry';

const { PORT, FRONTEND_URL } = process.env;

async function bootstrap() {
  // Error monitoring. No-ops entirely when SENTRY_DSN is unset, so the app
  // runs unchanged for a developer with no Sentry account. Initialised before
  // the Nest app is created so that failures during bootstrap are captured.
  if (initSentry()) {
    console.log('[bootstrap] Sentry error monitoring enabled');
  }

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

  // ─── Internal Swagger docs (JWT-authenticated, all routes) ───────────────────
  const internalConfig = new DocumentBuilder()
    .setTitle('BorderLess Internal API')
    .setDescription('Internal API for managing recruitment processes, user roles and more by EMP Employment Solutions.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const internalDocument = SwaggerModule.createDocument(app, internalConfig);
  SwaggerModule.setup('api/internal-docs', app, internalDocument, {
    customSiteTitle: 'BorderLess Internal API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // ─── Public API Swagger docs (API-key authenticated, public v1 routes only) ──
  const publicConfig = new DocumentBuilder()
    .setTitle('Borderless ATS Public API')
    .setDescription('REST API for third-party developers to integrate with Borderless ATS. ' + 'Authenticate using an API key in the X-API-Key header.')
    .setVersion('v1')
    .setContact('Borderless Support', 'https://borderlessats.com', '')
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'Your Borderless API key (format: blss_live_...)',
      },
      'api-key',
    )
    .build();

  const publicDocument = SwaggerModule.createDocument(app, publicConfig, {
    include: [PublicApiModule],
  });
  SwaggerModule.setup('api/docs', app, publicDocument, {
    customSiteTitle: 'Borderless ATS API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Seed default plan limits and feature flags — non-blocking, app starts even if seeding fails.
  try {
    const planLimitsService = app.get(PlanLimitsService);
    await planLimitsService.seedDefaults();
  } catch (err) {
    console.warn('[bootstrap] PlanLimits seed skipped:', err?.message ?? err);
  }

  try {
    const featureFlagsService = app.get(FeatureFlagsService);
    await featureFlagsService.seedDefaults();
  } catch (err) {
    console.warn('[bootstrap] FeatureFlags seed skipped:', err?.message ?? err);
  }

  await app.listen(PORT ?? 4000);
}
bootstrap();
