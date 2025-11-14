import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
	imports: [SharedModule],
	controllers: [FilesController],
	providers: [StorageService, FilesService],
	exports: [StorageService, FilesService],
})
export class StorageModule {}
