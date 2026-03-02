import { Module } from '@nestjs/common';
import { CustomPlansController } from './custom-plans.controller';
import { CustomPlansService } from './custom-plans.service';
import { DatabaseModule } from '../shared/modules/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomPlansController],
  providers: [CustomPlansService],
  exports: [CustomPlansService],
})
export class CustomPlansModule {}
