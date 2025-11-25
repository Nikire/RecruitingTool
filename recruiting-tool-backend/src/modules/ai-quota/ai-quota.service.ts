import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QuotaType } from '@prisma/client';
import { PrismaService } from '../shared/modules/database/prisma.service';
import {
  AIQuotaResponseDto,
  AIUsageLogResponseDto,
  SetQuotaLimitDto,
  UseQuotaDto,
} from './dto/ai-quota.dto';

@Injectable()
export class AIQuotaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get quota status for a company by quota type
   */
  async getQuota(
    companyUid: string,
    quotaType: QuotaType,
  ): Promise<AIQuotaResponseDto> {
    const company = await this.prisma.company.findUnique({
      where: { uid: companyUid },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const quota = await this.prisma.aIQuota.findUnique({
      where: {
        companyId_quotaType: {
          companyId: company.id,
          quotaType,
        },
      },
      include: {
        company: {
          select: { uid: true },
        },
      },
    });

    if (!quota) {
      throw new NotFoundException(
        `Quota for ${quotaType} not found for this company`,
      );
    }

    return this.mapToQuotaResponse(quota);
  }

  /**
   * Get all quotas for a company
   */
  async getAllQuotas(companyUid: string): Promise<AIQuotaResponseDto[]> {
    const company = await this.prisma.company.findUnique({
      where: { uid: companyUid },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const quotas = await this.prisma.aIQuota.findMany({
      where: { companyId: company.id },
      include: {
        company: {
          select: { uid: true },
        },
      },
      orderBy: { quotaType: 'asc' },
    });

    return quotas.map((quota) => this.mapToQuotaResponse(quota));
  }

  /**
   * Check if company has available quota
   */
  async checkQuota(
    companyUid: string,
    quotaType: QuotaType,
    amount = 1,
  ): Promise<boolean> {
    try {
      const quota = await this.getQuota(companyUid, quotaType);
      return quota.remaining >= amount;
    } catch (error) {
      // If quota doesn't exist, consider it as no quota available
      return false;
    }
  }

  /**
   * Use quota (decrement) and log usage
   */
  async useQuota(
    companyUid: string,
    userUid: string,
    dto: UseQuotaDto,
  ): Promise<AIQuotaResponseDto> {
    const company = await this.prisma.company.findUnique({
      where: { uid: companyUid },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { uid: userUid },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if quota exists
    const quota = await this.prisma.aIQuota.findUnique({
      where: {
        companyId_quotaType: {
          companyId: company.id,
          quotaType: dto.operation,
        },
      },
    });

    if (!quota) {
      throw new NotFoundException(
        `Quota for ${dto.operation} not found for this company`,
      );
    }

    // Check if enough quota is available
    const remaining = quota.limit - quota.used;
    if (remaining < dto.amount) {
      throw new ForbiddenException(
        `Insufficient quota. Requested: ${dto.amount}, Available: ${remaining}`,
      );
    }

    // Use quota and log usage in a transaction
    const [updatedQuota] = await this.prisma.$transaction([
      this.prisma.aIQuota.update({
        where: {
          companyId_quotaType: {
            companyId: company.id,
            quotaType: dto.operation,
          },
        },
        data: {
          used: {
            increment: dto.amount,
          },
        },
        include: {
          company: {
            select: { uid: true },
          },
        },
      }),
      this.prisma.aIUsageLog.create({
        data: {
          companyId: company.id,
          userId: user.id,
          operation: dto.operation,
          tokensUsed: dto.tokensUsed,
          cost: dto.cost,
        },
      }),
    ]);

    return this.mapToQuotaResponse(updatedQuota);
  }

  /**
   * Set or update quota limit for a company (Admin only)
   */
  async setQuotaLimit(
    companyUid: string,
    dto: SetQuotaLimitDto,
  ): Promise<AIQuotaResponseDto> {
    const company = await this.prisma.company.findUnique({
      where: { uid: companyUid },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Calculate next reset date (first day of next month)
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const quota = await this.prisma.aIQuota.upsert({
      where: {
        companyId_quotaType: {
          companyId: company.id,
          quotaType: dto.quotaType,
        },
      },
      update: {
        limit: dto.limit,
      },
      create: {
        companyId: company.id,
        quotaType: dto.quotaType,
        limit: dto.limit,
        used: 0,
        resetDate,
      },
      include: {
        company: {
          select: { uid: true },
        },
      },
    });

    return this.mapToQuotaResponse(quota);
  }

  /**
   * Get usage history for a company
   */
  async getUsageHistory(
    companyUid: string,
    startDate?: string,
    endDate?: string,
    operation?: QuotaType,
  ): Promise<AIUsageLogResponseDto[]> {
    const company = await this.prisma.company.findUnique({
      where: { uid: companyUid },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const where: any = {
      companyId: company.id,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (operation) {
      where.operation = operation;
    }

    const logs = await this.prisma.aIUsageLog.findMany({
      where,
      include: {
        company: {
          select: { uid: true },
        },
        user: {
          select: { uid: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 logs
    });

    return logs.map((log) => this.mapToUsageLogResponse(log));
  }

  /**
   * Reset all quotas (Cron job - runs on the 1st of every month at midnight)
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async resetQuotas(): Promise<void> {
    console.log('[AIQuotaService] Running monthly quota reset...');

    const now = new Date();
    const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Reset all quotas
    const result = await this.prisma.aIQuota.updateMany({
      where: {
        resetDate: {
          lte: now,
        },
      },
      data: {
        used: 0,
        resetDate: nextResetDate,
      },
    });

    console.log(`[AIQuotaService] Reset ${result.count} quotas`);
  }

  /**
   * Map Prisma AIQuota to AIQuotaResponseDto
   */
  private mapToQuotaResponse(quota: any): AIQuotaResponseDto {
    return {
      uid: quota.uid,
      companyUid: quota.company.uid,
      quotaType: quota.quotaType,
      limit: quota.limit,
      used: quota.used,
      remaining: quota.limit - quota.used,
      resetDate: quota.resetDate,
      createdAt: quota.createdAt,
      updatedAt: quota.updatedAt,
    };
  }

  /**
   * Map Prisma AIUsageLog to AIUsageLogResponseDto
   */
  private mapToUsageLogResponse(log: any): AIUsageLogResponseDto {
    return {
      uid: log.uid,
      companyUid: log.company.uid,
      userUid: log.user.uid,
      operation: log.operation,
      tokensUsed: log.tokensUsed,
      cost: log.cost,
      createdAt: log.createdAt,
    };
  }
}
