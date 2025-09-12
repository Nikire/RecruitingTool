import { Module } from '@nestjs/common';
import { DummyService } from './dummy.service';
import { HiringProcessModule } from '../hiring-process/hiring-process.module';
import { JobPositionModule } from '../job-position/job-position.module';
import { UsersModule } from '../users/users.module';
import { StagesModule } from '../hiring-process/modules/stages/stages.module';
import { CandidateModule } from '../hiring-process/modules/candidate/candidate.module';

@Module({
  imports: [HiringProcessModule, CandidateModule, StagesModule, JobPositionModule, UsersModule],
  providers: [DummyService],
})
export class DummyModule {}
