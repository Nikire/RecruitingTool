import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { BusinessMetricsService } from './business-metrics.service';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';
import { DatabaseModule } from '../shared/modules/database/database.module';

@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [MetricsController],
  providers: [
    MetricsService,
    BusinessMetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
  exports: [MetricsService, BusinessMetricsService],
})
export class MetricsModule {}
