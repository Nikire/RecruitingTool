import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { StorageModule } from '../storage/storage.module';

@Module({
	imports: [DatabaseModule, StorageModule],
	controllers: [ExportController],
	providers: [ExportService],
	exports: [ExportService],
})
export class ExportModule {}
