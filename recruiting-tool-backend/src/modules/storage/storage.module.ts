import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { DatabaseModule } from '../shared/modules/database/database.module';

@Module({
	imports: [DatabaseModule],
	controllers: [FilesController],
	providers: [StorageService, FilesService],
	exports: [StorageService, FilesService],
})
export class StorageModule {}
