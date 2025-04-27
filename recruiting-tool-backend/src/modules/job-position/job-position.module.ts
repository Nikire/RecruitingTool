import { forwardRef, Module } from '@nestjs/common';
import { JobPositionController } from './job-position.controller';
import { JobPositionService } from './job-position.service';
import { HiringProcessModule } from '../hiring-process/hiring-process.module';
import { CandidateModule } from '../hiring-process/modules/candidate/candidate.module';
import { StagesModule } from '../hiring-process/modules/stages/stages.module';

@Module({
  imports: [forwardRef(() => HiringProcessModule), CandidateModule, StagesModule],
  controllers: [JobPositionController],
  providers: [JobPositionService],
  exports: [JobPositionService],
})
export class JobPositionModule {}
