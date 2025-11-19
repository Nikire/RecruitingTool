import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { SharedModule } from '../shared/shared.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [SharedModule, EmailModule],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
