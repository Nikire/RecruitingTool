import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { InternalController } from './internal.controller';
import { InternalService } from './internal.service';
import { InternalApiKeyGuard } from './guards/internal-api-key.guard';

@Module({
  imports: [ConfigModule, EmailModule],
  controllers: [InternalController],
  providers: [InternalService, InternalApiKeyGuard],
})
export class InternalModule {}
