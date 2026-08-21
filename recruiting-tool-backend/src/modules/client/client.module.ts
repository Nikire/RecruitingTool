import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

/**
 * The Client module: an agency end clients / accounts.
 *
 * Exported so the job position and hiring process list filters can resolve a client UID
 * to a tenant-checked numeric id without duplicating the scoping rules.
 */
@Module({
  imports: [AuditLogModule],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
