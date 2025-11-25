import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './modules/shared/shared.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { HiringProcessModule } from './modules/hiring-process/hiring-process.module';
import { StagesModule } from './modules/hiring-process/modules/stages/stages.module';
import { CandidateModule } from './modules/hiring-process/modules/candidate/candidate.module';
import { JobPositionModule } from './modules/job-position/job-position.module';
import { DummyModule } from './modules/dummy/dummy.module';
import { CompanyModule } from './modules/company/company.module';
import { StorageModule } from './modules/storage/storage.module';
import { ApplicationModule } from './modules/application/application.module';
import { EmailTemplatesModule } from './modules/email-templates/email-templates.module';
import { InterviewModule } from './modules/interview/interview.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [UsersModule, SharedModule, ConfigModule.forRoot({ isGlobal: true }), CompanyModule, HiringProcessModule, StagesModule, CandidateModule, JobPositionModule, DummyModule, StorageModule, ApplicationModule, EmailTemplatesModule, InterviewModule, ProfileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
