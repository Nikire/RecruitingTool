import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './modules/shared/shared.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
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
import { CalendarModule } from './modules/calendar/calendar.module';
import { AIQuotaModule } from './modules/ai-quota/ai-quota.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { TimeSlotsModule } from './modules/time-slots/time-slots.module';
import { SseModule } from './modules/sse/sse.module';
import { BackupModule } from './modules/backup/backup.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from './modules/cache/cache.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { PerformanceMiddleware } from './common/middleware/performance.middleware';
import { StripeModule } from './modules/stripe/stripe.module';
import { QuotaModule } from './modules/quota/quota.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { NotificationPreferencesModule } from './modules/notification-preferences/notification-preferences.module';
import { CompanyRolesModule } from './modules/company-roles/company-roles.module';
import { ConnectionRequestsModule } from './modules/connection-requests/connection-requests.module';
import { CompanyInvitationsModule } from './modules/company-invitations/company-invitations.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { ContactMessagesModule } from './modules/contact-messages/contact-messages.module';
import { InternalModule } from './modules/internal/internal.module';
import { StageNotesModule } from './modules/stage-notes/stage-notes.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { PlanLimitsModule } from './modules/plan-limits/plan-limits.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { CustomPlansModule } from './modules/custom-plans/custom-plans.module';
import { CompanyCalendarSettingsModule } from './modules/company-calendar-settings/company-calendar-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CacheModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: parseInt(config.get('THROTTLE_TTL', '60000')), // TTL in milliseconds
            limit: parseInt(config.get('THROTTLE_LIMIT', '100')), // Max requests per TTL window
          },
        ],
      }),
    }),
    UsersModule,
    SharedModule,
    CompanyModule,
    HiringProcessModule,
    StagesModule,
    CandidateModule,
    JobPositionModule,
    DummyModule,
    StorageModule,
    ApplicationModule,
    EmailTemplatesModule,
    InterviewModule,
    ProfileModule,
    AdminModule,
    HRScheduleModule,
    ScorecardModule,
    AiModule,
    GoogleCalendarModule,
    CalendarModule,
    AIQuotaModule,
    AnalyticsModule,
    WebhooksModule,
    TimeSlotsModule,
    SseModule,
    BackupModule,
    AuditLogModule,
    HealthModule,
    MetricsModule,
    StripeModule,
    QuotaModule,
    NotificationsModule,
    NotificationPreferencesModule,
    CompanyRolesModule,
    ConnectionRequestsModule,
    CompanyInvitationsModule,
    FeedbackModule,
    ContactMessagesModule,
    InternalModule,
    StageNotesModule,
    SystemSettingsModule,
    PlanLimitsModule,
    FeatureFlagsModule,
    CustomPlansModule,
    CompanyCalendarSettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Temporarily disabled for E2E tests
    // {
    //   provide: APP_GUARD,
    //   useClass: CustomThrottlerGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply logging and performance monitoring to all routes
    // Order matters: logging first, then performance
    consumer.apply(LoggingMiddleware, PerformanceMiddleware).forRoutes('*');
  }
}
