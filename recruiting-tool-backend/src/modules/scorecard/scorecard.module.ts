import { Module } from '@nestjs/common';
import { ScorecardController } from './scorecard.controller';
import { ScorecardTemplateService } from './scorecard-template.service';
import { ScorecardService } from './scorecard.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [ScorecardController],
  providers: [ScorecardTemplateService, ScorecardService],
  exports: [ScorecardTemplateService, ScorecardService],
})
export class ScorecardModule {}
