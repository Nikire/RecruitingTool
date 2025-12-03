import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SharedModule } from '../shared/shared.module';
import { DeletedModule } from './deleted/deleted.module';

@Module({
  imports: [SharedModule, DeletedModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
