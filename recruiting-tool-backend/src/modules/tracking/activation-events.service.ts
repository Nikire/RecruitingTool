import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../shared/modules/database/database.service';
import { USER_ACTIVITY_ACTIONS, UserActivityAction } from '../users/services/user-activity.service';

/**
 * Server-side activation events.
 *
 * WHY SERVER-SIDE: the client analytics seam (`frontend/src/analytics/`) loses
 * 20-30% of its events to ad blockers and privacy browsers. The events that
 * actually predict retention - first job position, first candidate, first stage
 * advance, teammate invited - are too important to sample. They are persisted
 * here to `UserActivityLog`, which is an events table in all but name
 * (`action` + `metadata` Json + indexes on userId/action/createdAt).
 *
 * WHY FIRE-AND-FORGET: analytics must never break or slow a product request.
 * Every method here returns `void` synchronously and kicks off the write
 * without awaiting it; a failed write is logged and swallowed. This mirrors the
 * try/catch convention in `audit-log.service.ts` but goes one step further by
 * keeping the DB round-trip off the request's critical path entirely.
 *
 * The client fires the mirrored `first_job_position_created` /
 * `first_candidate_added` / `first_application_advanced` / `teammate_invited`
 * events through the analytics seam; this table is the durable source of truth
 * when the two disagree.
 */

/** JSON-serialisable properties attached to an activation event. */
export type ActivationEventMetadata = Record<string, Prisma.InputJsonValue | null | undefined>;

@Injectable()
export class ActivationEventsService {
  private readonly logger = new Logger(ActivationEventsService.name);

  constructor(private readonly prisma: DatabaseService) {}

  /**
   * A job position was created.
   *
   * FIRST-TIME DETECTION: resolved with a `count` gated on `companyId`, which is
   * served by the `@@index([companyId, deletedAt])` on JobPosition and capped at
   * `take: 2` - never a table scan. `metadata.isFirst` is authoritative.
   */
  jobPositionCreated(params: { userId: number; companyId: number; jobPositionUid: string; title?: string | null }): void {
    void this.withFirstFlag(
      () =>
        this.prisma.jobPosition.count({
          where: { companyId: params.companyId, deletedAt: null },
          take: 2,
        }),
      (isFirst) =>
        this.write(USER_ACTIVITY_ACTIONS.JOB_POSITION_CREATED, params.userId, {
          isFirst,
          companyId: params.companyId,
          jobPositionUid: params.jobPositionUid,
          title: params.title ?? null,
        }),
    );
  }

  /**
   * A candidate was created.
   *
   * FIRST-TIME DETECTION: `count` gated on `companyId` (served by
   * `@@index([companyId])` on Candidate), capped at `take: 2`.
   */
  candidateCreated(params: { userId: number; companyId: number; candidateUid: string; source?: string | null }): void {
    void this.withFirstFlag(
      () =>
        this.prisma.candidate.count({
          where: { companyId: params.companyId, deletedAt: null },
          take: 2,
        }),
      (isFirst) =>
        this.write(USER_ACTIVITY_ACTIONS.CANDIDATE_CREATED, params.userId, {
          isFirst,
          companyId: params.companyId,
          candidateUid: params.candidateUid,
          source: params.source ?? null,
        }),
    );
  }

  /**
   * A hiring process moved forward a stage.
   *
   * FIRST-TIME DETECTION: DELIBERATELY NOT COMPUTED. There is no company-scoped
   * counter for stage transitions, and deriving one would mean joining
   * UserActivityLog to User on every advance - the exact slow write this class
   * exists to avoid. Every occurrence is emitted with `isFirst: null`; the
   * analysis layer takes `MIN(createdAt) GROUP BY metadata->>'companyId'` to
   * recover the first-advance cohort. `mode` distinguishes the two call sites.
   */
  applicationStageAdvanced(params: { userId: number; companyId: number; hiringProcessUid: string; mode: 'NEXT' | 'SPECIFIC'; targetStageUid?: string | null }): void {
    void this.write(USER_ACTIVITY_ACTIONS.APPLICATION_STAGE_ADVANCED, params.userId, {
      isFirst: null,
      companyId: params.companyId,
      hiringProcessUid: params.hiringProcessUid,
      mode: params.mode,
      targetStageUid: params.targetStageUid ?? null,
    });
  }

  /**
   * A teammate invitation was sent. Every occurrence is emitted on purpose:
   * this is an expansion signal, not a one-off milestone, so seat growth over
   * time is the thing being measured.
   */
  teammateInvited(params: { userId: number; companyId: number; invitationUid: string; role?: string | null }): void {
    void this.write(USER_ACTIVITY_ACTIONS.TEAMMATE_INVITED, params.userId, {
      companyId: params.companyId,
      invitationUid: params.invitationUid,
      role: params.role ?? null,
    });
  }

  /** The post-signup onboarding wizard was finished. First by construction. */
  onboardingCompleted(params: { userId: number; companyId?: number | null }): void {
    void this.write(USER_ACTIVITY_ACTIONS.ONBOARDING_COMPLETED, params.userId, {
      isFirst: true,
      companyId: params.companyId ?? null,
    });
  }

  /**
   * Run the cheap company-scoped count, then emit. The row that triggered this
   * call is already committed, so a count of 1 means "this was the first".
   * A failed count degrades to `isFirst: null` instead of dropping the event.
   */
  private async withFirstFlag(count: () => Promise<number>, emit: (isFirst: boolean | null) => Promise<void>): Promise<void> {
    let isFirst: boolean | null = null;
    try {
      isFirst = (await count()) <= 1;
    } catch (error) {
      this.logger.warn(`Activation event first-time check failed: ${error?.message}`);
    }
    await emit(isFirst);
  }

  /**
   * The single write. Never throws - a lost analytics row must never surface to
   * the user or roll back the product mutation that produced it.
   */
  private async write(action: UserActivityAction, userId: number, metadata: ActivationEventMetadata): Promise<void> {
    try {
      await this.prisma.userActivityLog.create({
        data: {
          userId,
          action,
          metadata: metadata as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to persist activation event ${action} for user ${userId}: ${error?.message}`);
    }
  }
}
