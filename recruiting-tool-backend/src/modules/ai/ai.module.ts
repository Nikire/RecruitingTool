import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ScoringService } from './scoring.service';
import { AiController } from './ai.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [AiController],
  providers: [AiService, ScoringService],
  exports: [AiService, ScoringService],
})
export class AiModule {}
