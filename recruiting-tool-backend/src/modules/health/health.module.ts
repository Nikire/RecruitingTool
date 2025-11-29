import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { StorageModule } from '../storage/storage.module';
import { EmailModule } from '../email/email.module';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { StorageHealthIndicator } from './indicators/storage.health';
import { EmailHealthIndicator } from './indicators/email.health';

@Module({
  imports: [TerminusModule, DatabaseModule, StorageModule, EmailModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, StorageHealthIndicator, EmailHealthIndicator],
})
export class HealthModule {}
