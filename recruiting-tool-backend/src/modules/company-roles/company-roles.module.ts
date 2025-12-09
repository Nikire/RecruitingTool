import { Module } from '@nestjs/common';
import { CompanyRolesController } from './company-roles.controller';
import { CompanyRolesService } from './company-roles.service';
import { RoleHierarchyService } from './services/role-hierarchy.service';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { AuthModule } from '../shared/modules/auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, AuthModule, NotificationsModule],
  controllers: [CompanyRolesController],
  providers: [CompanyRolesService, RoleHierarchyService],
  exports: [CompanyRolesService, RoleHierarchyService],
})
export class CompanyRolesModule {}
