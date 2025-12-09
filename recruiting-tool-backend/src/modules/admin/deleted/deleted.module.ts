import { Module } from '@nestjs/common';
import { DeletedController } from './deleted.controller';
import { DeletedService } from './deleted.service';
import { DatabaseModule } from '../../shared/modules/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DeletedController],
  providers: [DeletedService],
  exports: [DeletedService],
})
export class DeletedModule {}
