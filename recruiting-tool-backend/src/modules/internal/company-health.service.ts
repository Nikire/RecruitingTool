import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { AdminService } from '../admin/admin.service';
import { DatabaseService } from '../shared/modules/database/database.service';
import { InternalService } from './internal.service';
import { CompanyHealthDegradationDto, CompanyHealthDigestRunDto, CompanyHealthSnapshotRunDto } from './dto/company-health-digest.dto';

const DAY_MS = 24 * 60 * 60 * 1000;

/** How far back the weekly digest reads snapshots to find a "one week ago" reading. */
const DIGEST_WINDOW_DAYS = 14;

/** A snapshot older than this means the nightly job did not run; the digest takes one itself. */
const STALE_SNAPSHOT_MS = 36 * 60 * 60 * 1000;

/**
 * P3-9 — pushes the admin Company Health scorer instead of waiting for someone to open
 * the admin page.
 *
 *   * nightly  — persist one `CompanyHealthSnapshot` per company, turning a
 *                point-in-time score into a trend.
 *   * weekly   — email the founder every company whose tier got WORSE versus the
 *                snapshot from a week ago, reusing the existing
 *                `POST /api/internal/batch-summary` mail plumbing.
 *
 * Both jobs follow the project's background-work convention (see TokenCleanupService):
 * everything inside a try/catch that logs and swallows, so a failing cron can never
 * take the process down. Both are additionally inert under NODE_ENV=test.
 */
@Injectable()
export class CompanyHealthService {
  private readonly logger = new Logger(CompanyHealthService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly adminService: AdminService,
    private readonly internalService: InternalService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Jobs are inert in tests (a cron firing mid-suite would write rows and send mail)
   * and can be switched off in any environment with COMPANY_HEALTH_JOBS_ENABLED=false.
   *
   * NODE_ENV is read through ConfigService to match how AppModule disables the
   * throttler guard under test.
   */
  private isDisabled(): boolean {
    if (this.configService.get<string>('NODE_ENV') === 'test') return true;
    return this.configService.get<string>('COMPANY_HEALTH_JOBS_ENABLED') === 'false';
  }

  // ─── Nightly snapshot ────────────────────────────────────────────────────────

  /** Every night at 04:00. 02:00 is the DB backup and 03:00 is token cleanup. */
  @Cron('0 4 * * *', { name: 'company-health-snapshot' })
  async handleNightlySnapshot(): Promise<void> {
    if (this.isDisabled()) {
      this.logger.debug('Nightly company health snapshot skipped (disabled or test env)');
      return;
    }

    try {
      const result = await this.captureSnapshots();
      this.logger.log(`Nightly company health snapshot wrote ${result.snapshotsWritten} row(s)`);
    } catch (error) {
      // Fail safe: a crashing cron must not take the app down.
      this.logger.error(`Nightly company health snapshot failed: ${error?.message ?? error}`, error?.stack);
    }
  }

  /**
   * Persist one snapshot row per company. Safe to call more than once a day — rows are
   * append-only and the digest only ever reads the most recent one per company.
   */
  async captureSnapshots(now: Date = new Date()): Promise<CompanyHealthSnapshotRunDto> {
    // A handful of aggregate queries regardless of company count. See
    // AdminService.collectCompanyHealthSignals.
    const rows = await this.adminService.collectCompanyHealthSignals(now);

    if (rows.length === 0) {
      return { snapshotsWritten: 0, ran: true };
    }

    const created = await this.databaseService.companyHealthSnapshot.createMany({
      data: rows.map((row) => ({
        companyId: row.companyId,
        tier: row.riskTier,
        score: row.healthScore,
        lastLoginDaysAgo: row.lastLoginDaysAgo,
        activeJobPositions: row.activeJobPositions,
        applicationsThisMonth: row.applicationsThisMonth,
        hiringActivitiesThisMonth: row.hiringActivitiesThisMonth,
        createdAt: now,
      })),
    });

    return { snapshotsWritten: created.count, ran: true };
  }

  // ─── Weekly degradation digest ───────────────────────────────────────────────

  /** Mondays at 08:00 — after that morning's 04:00 snapshot. */
  @Cron('0 8 * * 1', { name: 'company-health-weekly-digest' })
  async handleWeeklyDigest(): Promise<void> {
    if (this.isDisabled()) {
      this.logger.debug('Weekly company health digest skipped (disabled or test env)');
      return;
    }

    try {
      const result = await this.runWeeklyDigest();
      this.logger.log(
        `Weekly company health digest: compared ${result.companiesCompared} company/companies, ` +
          `${result.degradedCount} degraded, email ${result.emailSent ? 'sent' : 'not sent'}`,
      );
    } catch (error) {
      // Fail safe: a crashing cron must not take the app down.
      this.logger.error(`Weekly company health digest failed: ${error?.message ?? error}`, error?.stack);
    }
  }

  /**
   * Compare each company's most recent snapshot against the newest snapshot that is at
   * least a week old, and mail the founder about every tier that got worse.
   *
   * Companies without a prior-week reading are skipped rather than reported: a brand
   * new account has no trend, and reporting it as "degraded" would train the founder to
   * ignore the email.
   */
  async runWeeklyDigest(now: Date = new Date()): Promise<CompanyHealthDigestRunDto> {
    // If the nightly job has not run recently the "current" reading would be stale, so
    // take one now. This is what makes the digest correct on a box where the nightly
    // cron was disabled or the process restarted through its window.
    const newest = await this.databaseService.companyHealthSnapshot.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (!newest || now.getTime() - newest.createdAt.getTime() > STALE_SNAPSHOT_MS) {
      this.logger.warn('No fresh company health snapshot found — capturing one before building the digest');
      await this.captureSnapshots(now);
    }

    const windowStart = new Date(now.getTime() - DIGEST_WINDOW_DAYS * DAY_MS);
    const priorCutoff = new Date(now.getTime() - 7 * DAY_MS);

    const snapshots = await this.databaseService.companyHealthSnapshot.findMany({
      where: { createdAt: { gte: windowStart } },
      orderBy: { createdAt: 'desc' },
      select: {
        companyId: true,
        tier: true,
        score: true,
        createdAt: true,
        lastLoginDaysAgo: true,
        activeJobPositions: true,
        applicationsThisMonth: true,
        hiringActivitiesThisMonth: true,
        company: {
          select: {
            uid: true,
            name: true,
            subscription: { select: { plan: true } },
          },
        },
      },
    });

    // Snapshots arrive newest-first, so the first row seen for a company is its current
    // reading and the first row at/older than the cutoff is its prior-week reading.
    const byCompany = new Map<number, typeof snapshots>();
    for (const snapshot of snapshots) {
      const bucket = byCompany.get(snapshot.companyId);
      if (bucket) bucket.push(snapshot);
      else byCompany.set(snapshot.companyId, [snapshot]);
    }

    const degradations: CompanyHealthDegradationDto[] = [];
    let companiesCompared = 0;

    for (const bucket of byCompany.values()) {
      const current = bucket[0];
      const prior = bucket.find((s) => s.createdAt.getTime() <= priorCutoff.getTime());
      if (!prior) continue;

      const currentRank = AdminService.rankHealthTier(current.tier);
      const priorRank = AdminService.rankHealthTier(prior.tier);
      // -1 means the tier was never recorded; there is nothing to compare.
      if (currentRank === -1 || priorRank === -1) continue;

      companiesCompared += 1;
      if (currentRank <= priorRank) continue;

      degradations.push({
        companyUid: current.company.uid,
        companyName: current.company.name,
        plan: current.company.subscription?.plan ?? 'FREE',
        previousTier: prior.tier as string,
        currentTier: current.tier as string,
        previousScore: prior.score,
        currentScore: current.score,
        previousAt: prior.createdAt,
        currentAt: current.createdAt,
        lastLoginDaysAgo: current.lastLoginDaysAgo,
        activeJobPositions: current.activeJobPositions,
        applicationsThisMonth: current.applicationsThisMonth,
        hiringActivitiesThisMonth: current.hiringActivitiesThisMonth,
      });
    }

    // Worst tier first, then biggest score drop first.
    degradations.sort((a, b) => {
      const rankDiff = AdminService.rankHealthTier(b.currentTier) - AdminService.rankHealthTier(a.currentTier);
      if (rankDiff !== 0) return rankDiff;
      const aDrop = (a.previousScore ?? 0) - (a.currentScore ?? 0);
      const bDrop = (b.previousScore ?? 0) - (b.currentScore ?? 0);
      return bDrop - aDrop;
    });

    if (degradations.length === 0) {
      return { ran: true, companiesCompared, degradedCount: 0, emailSent: false };
    }

    await this.internalService.sendCompanyHealthDigest(degradations, now);

    return { ran: true, companiesCompared, degradedCount: degradations.length, emailSent: true };
  }
}
