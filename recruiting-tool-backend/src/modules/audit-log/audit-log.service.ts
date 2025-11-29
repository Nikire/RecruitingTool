import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { User } from '@prisma/client';

export interface AuditLogData {
  action: 'SOFT_DELETE' | 'HARD_DELETE' | 'RESTORE' | 'PURGE';
  entityType: 'JobPosition' | 'Candidate' | 'Application' | 'Interview' | 'Stage' | 'HiringProcess' | 'User';
  entityId: number;
  entityUid: string;
  user: User;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: DatabaseService) {}

  async logAction(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          entityUid: data.entityUid,
          userId: data.user.id,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadata: data.metadata,
        },
      });
    } catch (error) {
      // Log error but don't fail the operation if audit logging fails
      console.error('Failed to create audit log:', error);
    }
  }

  async getAuditTrail(entityUid: string) {
    return this.prisma.auditLog.findMany({
      where: { entityUid },
      include: {
        user: {
          select: {
            uid: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getAuditTrailByEntity(entityType: string, entityUid: string) {
    return this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityUid,
      },
      include: {
        user: {
          select: {
            uid: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getUserAuditLogs(userId: number) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            uid: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }
}
