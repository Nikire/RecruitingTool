import { forwardRef, Module } from '@nestjs/common';
import { HiringProcessService } from './hiring-process.service';
import { HiringProcessController } from './hiring-process.controller';
import { HiringProcessPublicController } from './hiring-process-public.controller';
import { JobPositionModule } from '../job-position/job-position.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { StagesModule } from './modules/stages/stages.module';
import { QuotaModule } from '../quota/quota.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [forwardRef(() => JobPositionModule), CandidateModule, StagesModule, QuotaModule, NotificationsModule, EmailModule],
  controllers: [HiringProcessController, HiringProcessPublicController],
  providers: [HiringProcessService],
  exports: [HiringProcessService],
})
export class HiringProcessModule {}
