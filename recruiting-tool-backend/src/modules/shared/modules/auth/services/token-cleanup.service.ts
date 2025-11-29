import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from '../auth.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Run cleanup every day at 3 AM
   * Removes expired and old revoked tokens from database
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleTokenCleanup(): Promise<void> {
    this.logger.log('Starting automatic token cleanup...');

    try {
      const deletedCount = await this.authService.cleanupExpiredTokens();
      this.logger.log(`Token cleanup completed. Deleted ${deletedCount} expired/revoked tokens.`);
    } catch (error) {
      this.logger.error('Error during token cleanup:', error);
    }
  }
}
