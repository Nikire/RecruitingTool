import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { StorageModule } from '../storage/storage.module';
import { EmailTemplatesModule } from '../email-templates/email-templates.module';

@Module({
  imports: [DatabaseModule, StorageModule, EmailTemplatesModule],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
