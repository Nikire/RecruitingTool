import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClient = any;

@Injectable()
export class UnsubscribeService {
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * Consumes a token: marks usedAt if not already used.
   * Returns success=true and the associated email on success.
   */
  async consumeToken(token: string): Promise<{ success: boolean; email: string | null }> {
    const db = this.prisma as PrismaClient;

    const record = await db.emailUnsubscribe.findUnique({ where: { token } });

    if (!record) {
      // Token not found — return success to avoid leaking info
      return { success: true, email: null };
    }

    if (record.usedAt) {
      // Already consumed — still report success
      return { success: true, email: record.email };
    }

    // Mark as used now
    await db.emailUnsubscribe.update({
      where: { token },
      data: { usedAt: new Date() },
    });

    return { success: true, email: record.email };
  }

  /**
   * Returns true if the given email has an EmailUnsubscribe record with usedAt set.
   */
  async isEmailUnsubscribed(email: string): Promise<boolean> {
    const db = this.prisma as PrismaClient;

    const record = await db.emailUnsubscribe.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, usedAt: { not: null } },
    });

    return record !== null;
  }
}
