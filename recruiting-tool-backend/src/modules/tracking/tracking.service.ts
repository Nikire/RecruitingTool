import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClient = any;

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(private readonly prisma: DatabaseService) {}

  /** Record an email open event for the given lead UID. Returns false if lead not found. */
  async recordOpen(leadUid: string): Promise<boolean> {
    const db = this.prisma as PrismaClient;
    const lead = await db.outreachLead.findUnique({ where: { uid: leadUid } });
    if (!lead) return false;

    const now = new Date();
    await db.outreachLead.update({
      where: { uid: leadUid },
      data: {
        openCount: { increment: 1 },
        lastOpenedAt: now,
        ...(lead.openedAt == null ? { openedAt: now } : {}),
      },
    });

    this.logger.debug(`Open tracked for lead ${leadUid}`);
    return true;
  }

  /** Record an email click event for the given lead UID. Returns false if lead not found. */
  async recordClick(leadUid: string): Promise<boolean> {
    const db = this.prisma as PrismaClient;
    const lead = await db.outreachLead.findUnique({ where: { uid: leadUid } });
    if (!lead) return false;

    const now = new Date();
    await db.outreachLead.update({
      where: { uid: leadUid },
      data: {
        clickCount: { increment: 1 },
        lastClickedAt: now,
        ...(lead.clickedAt == null ? { clickedAt: now } : {}),
      },
    });

    this.logger.debug(`Click tracked for lead ${leadUid}`);
    return true;
  }
}
