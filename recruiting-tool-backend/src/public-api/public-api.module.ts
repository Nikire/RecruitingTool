import { Module } from '@nestjs/common';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { PublicCandidatesModule } from './candidates/public-candidates.module';
import { PublicJobPositionsModule } from './job-positions/public-job-positions.module';
import { PublicApplicationsModule } from './applications/public-applications.module';
import { PublicWebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [ApiKeysModule, PublicCandidatesModule, PublicJobPositionsModule, PublicApplicationsModule, PublicWebhooksModule],
})
export class PublicApiModule {}
