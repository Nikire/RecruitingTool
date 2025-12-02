import { Module } from '@nestjs/common';
import { DeletedController } from './deleted.controller';
import { DeletedService } from './deleted.service';
import { PrismaModule } from '../../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeletedController],
  providers: [DeletedService],
  exports: [DeletedService],
})
export class DeletedModule {}
