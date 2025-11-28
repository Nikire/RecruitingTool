import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { RolesType } from '@prisma/client';

@ApiTags('audit-log')
@ApiBearerAuth()
@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get(':entityUid')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get audit trail for an entity by UID' })
  @ApiParam({ name: 'entityUid', description: 'Entity UID to retrieve audit trail for' })
  async getAuditTrail(@Param('entityUid') entityUid: string) {
    return this.auditLogService.getAuditTrail(entityUid);
  }

  @Get(':entityType/:entityUid')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get audit trail for a specific entity type and UID' })
  @ApiParam({ name: 'entityType', description: 'Entity type (JobPosition, Candidate, Application, Interview)' })
  @ApiParam({ name: 'entityUid', description: 'Entity UID to retrieve audit trail for' })
  async getAuditTrailByEntity(@Param('entityType') entityType: string, @Param('entityUid') entityUid: string) {
    return this.auditLogService.getAuditTrailByEntity(entityType, entityUid);
  }
}
