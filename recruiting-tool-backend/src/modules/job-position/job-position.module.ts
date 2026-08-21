import { forwardRef, Module } from '@nestjs/common';
import { JobPositionController } from './job-position.controller';
import { JobPositionService } from './job-position.service';
import { JobPositionModerationController } from './job-position-moderation.controller';
import { JobPositionModerationService } from './job-position-moderation.service';
import { HiringProcessModule } from '../hiring-process/hiring-process.module';
import { CandidateModule } from '../hiring-process/modules/candidate/candidate.module';
import { StagesModule } from '../hiring-process/modules/stages/stages.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { QuotaModule } from '../quota/quota.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => HiringProcessModule), CandidateModule, StagesModule, AuditLogModule, QuotaModule, NotificationsModule],
  controllers: [JobPositionController, JobPositionModerationController],
  providers: [JobPositionService, JobPositionModerationService],
  exports: [JobPositionService, JobPositionModerationService],
})
export class JobPositionModule {}
