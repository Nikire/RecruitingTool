import { forwardRef, Module } from '@nestjs/common';
import { JobPositionController } from './job-position.controller';
import { JobPositionService } from './job-position.service';
import { HiringProcessModule } from '../hiring-process/hiring-process.module';
import { CandidateModule } from '../hiring-process/modules/candidate/candidate.module';
import { StagesModule } from '../hiring-process/modules/stages/stages.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { QuotaModule } from '../quota/quota.module';

@Module({
  imports: [forwardRef(() => HiringProcessModule), CandidateModule, StagesModule, AuditLogModule, QuotaModule],
  controllers: [JobPositionController],
  providers: [JobPositionService],
  exports: [JobPositionService],
})
export class JobPositionModule {}
