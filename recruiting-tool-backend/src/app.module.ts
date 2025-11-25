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
import { AdminModule } from './modules/admin/admin.module';
import { HRScheduleModule } from './modules/hr-schedule/hr-schedule.module';
import { ScorecardModule } from './modules/scorecard/scorecard.module';
import { AiModule } from './modules/ai/ai.module';
import { GoogleCalendarModule } from './modules/google-calendar/google-calendar.module';
import { AIQuotaModule } from './modules/ai-quota/ai-quota.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [UsersModule, SharedModule, ConfigModule.forRoot({ isGlobal: true }), CompanyModule, HiringProcessModule, StagesModule, CandidateModule, JobPositionModule, DummyModule, StorageModule, ApplicationModule, EmailTemplatesModule, InterviewModule, ProfileModule, AdminModule, HRScheduleModule, ScorecardModule, AiModule, GoogleCalendarModule, AIQuotaModule, AnalyticsModule, WebhooksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
