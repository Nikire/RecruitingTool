import { forwardRef, Module } from '@nestjs/common';
import { HiringProcessService } from './hiring-process.service';
import { HiringProcessController } from './hiring-process.controller';
import { JobPositionModule } from '../job-position/job-position.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { StagesModule } from './modules/stages/stages.module';
import { QuotaModule } from '../quota/quota.module';

@Module({
  imports: [forwardRef(() => JobPositionModule), CandidateModule, StagesModule, QuotaModule],
  controllers: [HiringProcessController],
  providers: [HiringProcessService],
  exports: [HiringProcessService],
})
export class HiringProcessModule {}
