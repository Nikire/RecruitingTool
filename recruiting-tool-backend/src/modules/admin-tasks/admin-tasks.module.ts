import { Module } from '@nestjs/common';
import { AdminTasksController } from './admin-tasks.controller';
import { AdminTasksService } from './admin-tasks.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [AdminTasksController],
  providers: [AdminTasksService],
})
export class AdminTasksModule {}
