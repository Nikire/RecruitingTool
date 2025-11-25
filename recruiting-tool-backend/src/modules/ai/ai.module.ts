import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ScoringService } from './scoring.service';
import { BatchScoringService } from './batch-scoring.service';
import { AiController } from './ai.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [AiController],
  providers: [AiService, ScoringService, BatchScoringService],
  exports: [AiService, ScoringService, BatchScoringService],
})
export class AiModule {}
