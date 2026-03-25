import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ScoringService } from './scoring.service';
import { BatchScoringService } from './batch-scoring.service';
import { GeminiService } from './gemini.service';
import { AiController } from './ai.controller';
import { SharedModule } from '../shared/shared.module';
import { SseModule } from '../sse/sse.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [SharedModule, SseModule, StorageModule],
  controllers: [AiController],
  providers: [AiService, ScoringService, BatchScoringService, GeminiService],
  exports: [AiService, ScoringService, BatchScoringService, GeminiService],
})
export class AiModule {}
