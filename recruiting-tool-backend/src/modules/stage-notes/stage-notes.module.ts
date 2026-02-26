import { Module } from '@nestjs/common';
import { StageNotesController } from './stage-notes.controller';
import { StageNotesService } from './stage-notes.service';

@Module({
  controllers: [StageNotesController],
  providers: [StageNotesService],
  exports: [StageNotesService],
})
export class StageNotesModule {}
