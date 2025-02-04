import { Module } from '@nestjs/common';
import { HiringProcessService } from './hiring-process.service';
import { HiringProcessController } from './hiring-process.controller';

@Module({
  controllers: [HiringProcessController],
  providers: [HiringProcessService],
})
export class HiringProcessModule {}
