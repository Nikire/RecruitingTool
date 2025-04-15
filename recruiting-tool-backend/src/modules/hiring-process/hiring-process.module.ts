import { Module } from '@nestjs/common';
import { HiringProcessService } from './hiring-process.service';
import { HiringProcessController } from './hiring-process.controller';
import { JobPositionModule } from '../job-position/job-position.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { StagesModule } from './modules/stages/stages.module';

@Module({
  imports: [JobPositionModule, CandidateModule, StagesModule],
  controllers: [HiringProcessController],
  providers: [HiringProcessService],
})
export class HiringProcessModule {}
