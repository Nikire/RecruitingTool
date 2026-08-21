import { Module, NestModule, MiddlewareConsumer, ExecutionContext } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './modules/shared/shared.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HiringProcessModule } from './modules/hiring-process/hiring-process.module';
import { StagesModule } from './modules/hiring-process/modules/stages/stages.module';
import { CandidateModule } from './modules/hiring-process/modules/candidate/candidate.module';
import { ClientModule } from './modules/client/client.module';
import { JobPositionModule } from './modules/job-position/job-position.module';
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
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { CacheModule } from './modules/cache/cache.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { PerformanceMiddleware } from './common/middleware/performance.middleware';
import { DodoPaymentsModule } from './modules/dodo-payments/dodo-payments.module';
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
import { DemoBookingModule } from './modules/demo-booking/demo-booking.module';
import { AsyncStageModule } from './modules/async-stage/async-stage.module';
import { DummyModule } from './modules/dummy/dummy.module';
import { ProspectTrackingModule } from './modules/prospect-tracking/prospect-tracking.module';
import { ReleaseNotesModule } from './modules/release-notes/release-notes.module';
import { AdminTasksModule } from './modules/admin-tasks/admin-tasks.module';
import { OutreachCampaignsModule } from './modules/outreach-campaigns/outreach-campaigns.module';
import { UnsubscribeModule } from './modules/unsubscribe/unsubscribe.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { PublicApiModule } from './public-api/public-api.module';
import { ApiKeyManagementModule } from './modules/api-key-management/api-key-management.module';

/**
 * Route prefixes exempted from the global IP rate limiter.
 *
 * Each of these is either already authenticated by its own guard, or is a
 * machine-to-machine caller whose whole traffic arrives from a single IP —
 * exactly the shape that per-IP throttling misfires on.
 */
const THROTTLE_EXEMPT_PREFIXES = [
  // Long-lived SSE stream. A client that drops its connection reconnects
  // immediately; a reconnect storm across a few browser tabs would otherwise
  // trip the limit and lock the user out of live updates.
  '/api/sse',
  // Inbound Dodo Payments webhook. Already signature-verified. Every retry and
  // burst arrives from the provider's IPs; dropping one means losing
  // subscription state, which is far worse than the abuse it would prevent.
  '/api/billing/webhook',
  // Inbound automation webhooks, already gated by WebhookAuthGuard (X-API-Key).
  '/api/webhooks',
  // Email open/click pixels. A corporate mail gateway prefetching links for
  // many recipients hits these from one IP in a burst.
  '/api/tracking',
  // Uptime monitors and the Prometheus scraper poll these on a fixed interval.
  // /api/metrics is bearer-token protected; liveness/readiness are trivial.
  '/api/health/liveness',
  '/api/health/readiness',
  '/api/metrics',
];

/**
 * Decides whether the global throttler should stand down for this request.
 *
 * Three reasons to skip, in order:
 *
 * 1. Test runs. The E2E suites make 17 login and 7 register calls, against
 *    limits of 5-per-15-minutes and 3-per-hour. This is why the global guard
 *    was commented out as "temporarily disabled for E2E tests" — turning it
 *    back on without this escape hatch would just break the suite again.
 *
 * 2. The project's own @SkipThrottle() decorator. It lives in
 *    common/decorators/throttle.decorator.ts and sets a 'skipThrottle'
 *    metadata key that @nestjs/throttler does not know about — the library
 *    reads its own THROTTLER_SKIP key. With the global guard off this was
 *    harmless; with it on, the ~13 auth routes marked @SkipThrottle() (token
 *    verification, refresh, logout) would silently start being throttled.
 *    Honouring the metadata here makes the existing decorator do what every
 *    call site already assumes it does.
 *
 * 3. The exempt prefixes above.
 */
function shouldSkipThrottling(context: ExecutionContext, config: ConfigService, reflector: Reflector): boolean {
  if (config.get('NODE_ENV') === 'test' || config.get('THROTTLE_DISABLED') === 'true') {
    return true;
  }

  // Non-HTTP contexts have no IP to track; never throttle them.
  if (context.getType() !== 'http') {
    return true;
  }

  const skipMetadata = reflector.getAllAndOverride<boolean>('skipThrottle', [context.getHandler(), context.getClass()]);
  if (skipMetadata) {
    return true;
  }

  const request = context.switchToHttp().getRequest();
  const path: string = request?.route?.path || request?.path || request?.url || '';

  return THROTTLE_EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix));
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    CacheModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService, Reflector],
      useFactory: (config: ConfigService, reflector: Reflector) => ({
        throttlers: [
          {
            name: 'default',
            ttl: parseInt(config.get('THROTTLE_TTL', '60000')), // TTL in milliseconds
            limit: parseInt(config.get('THROTTLE_LIMIT', '100')), // Max requests per TTL window
          },
        ],
        skipIf: (context: ExecutionContext) => shouldSkipThrottling(context, config, reflector),
      }),
    }),
    UsersModule,
    SharedModule,
    CompanyModule,
    HiringProcessModule,
    StagesModule,
    CandidateModule,
    JobPositionModule,
    ClientModule,
    ...(process.env.DUMMY_DATA_ENABLED === 'true' ? [DummyModule] : []),
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
    DodoPaymentsModule,
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
    DemoBookingModule,
    AsyncStageModule,
    ProspectTrackingModule,
    ReleaseNotesModule,
    AdminTasksModule,
    OutreachCampaignsModule,
    UnsubscribeModule,
    TrackingModule,
    PublicApiModule,
    ApiKeyManagementModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global IP rate limiting. Previously commented out as "temporarily
    // disabled for E2E tests", which meant every per-route @Throttle in the
    // codebase — login attempts, registration, AI spend, public application
    // submissions — was inert in production, because those decorators only
    // configure a guard that was never installed. The E2E problem is handled
    // by shouldSkipThrottling() above rather than by leaving this off.
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply logging and performance monitoring to all routes
    // Order matters: logging first, then performance
    consumer.apply(LoggingMiddleware, PerformanceMiddleware).forRoutes('*');
  }
}
