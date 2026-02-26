import { Module } from '@nestjs/common';
import { PlanLimitsController } from './plan-limits.controller';
import { PlanLimitsService } from './plan-limits.service';
import { DatabaseModule } from '../shared/modules/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PlanLimitsController],
  providers: [PlanLimitsService],
  exports: [PlanLimitsService],
})
export class PlanLimitsModule {}
