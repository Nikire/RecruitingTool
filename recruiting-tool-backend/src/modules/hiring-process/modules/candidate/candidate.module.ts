import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { CandidateImportService } from './candidate-import.service';
import { CandidateActivityService } from './services/candidate-activity.service';
import { EmailModule } from 'src/modules/email/email.module';
import { StorageModule } from 'src/modules/storage/storage.module';
import { AuditLogModule } from 'src/modules/audit-log/audit-log.module';

@Module({
  imports: [
    EmailModule,
    StorageModule,
    AuditLogModule,
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
    }),
  ],
  controllers: [CandidateController],
  providers: [CandidateService, CandidateImportService, CandidateActivityService],
  exports: [CandidateService],
})
export class CandidateModule {}
