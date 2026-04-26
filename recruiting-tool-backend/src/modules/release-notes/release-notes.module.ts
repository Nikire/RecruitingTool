import { Module } from '@nestjs/common';
import { ReleaseNotesController } from './release-notes.controller';
import { ReleaseNotesService } from './release-notes.service';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [DatabaseModule, SharedModule],
  controllers: [ReleaseNotesController],
  providers: [ReleaseNotesService],
  exports: [ReleaseNotesService],
})
export class ReleaseNotesModule {}
