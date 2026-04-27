import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { SubscriptionPlan } from '@prisma/client';
import { UnreadReleaseNotesResponseDto, MarkSeenResponseDto } from './dto/release-note.dto';

@Injectable()
export class ReleaseNotesService {
  constructor(private databaseService: DatabaseService) {}

  async getUnreadNotes(userId: number): Promise<UnreadReleaseNotesResponseDto> {
    try {
      // Determine the user's subscription plan via their company
      const user = await this.databaseService.user.findUnique({
        where: { id: userId },
        include: { company: { include: { subscription: true } } },
      });

      if (!user) throw new NotFoundException('User not found');

      const plan: SubscriptionPlan = user.company?.subscription?.plan ?? SubscriptionPlan.FREE;

      // Determine which tiers apply to this user
      const allowedTiers: string[] = ['all'];
      if (plan === SubscriptionPlan.PROFESSIONAL || plan === SubscriptionPlan.ENTERPRISE) {
        allowedTiers.push('professional');
      }
      if (plan === SubscriptionPlan.ENTERPRISE) {
        allowedTiers.push('enterprise');
      }

      // Get published notes the user hasn't seen yet in their tier
      const notes = await this.databaseService.releaseNote.findMany({
        where: {
          isPublished: true,
          targetTier: { in: allowedTiers },
          seenBy: {
            none: { userId },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        notes: notes.map((n) => ({
          uid: n.uid,
          title: n.title,
          body: n.body,
          version: n.version ?? null,
          targetTier: n.targetTier,
          publishedAt: n.publishedAt ?? null,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Failed to get unread release notes: ${error.message}`);
    }
  }

  async markSeen(uid: string, userId: number): Promise<MarkSeenResponseDto> {
    try {
      const note = await this.databaseService.releaseNote.findUnique({ where: { uid } });
      if (!note) throw new NotFoundException(`Release note not found: ${uid}`);

      await this.databaseService.seenReleaseNote.upsert({
        where: { userId_releaseNoteId: { userId, releaseNoteId: note.id } },
        create: { userId, releaseNoteId: note.id },
        update: {},
      });

      return { ok: true };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Failed to mark release note as seen: ${error.message}`);
    }
  }
}
