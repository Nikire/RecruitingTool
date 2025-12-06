import { Module } from '@nestjs/common';
import { CompanyRolesController } from './company-roles.controller';
import { CompanyRolesService } from './company-roles.service';
import { RoleHierarchyService } from './services/role-hierarchy.service';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { AuthModule } from '../shared/modules/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CompanyRolesController],
  providers: [CompanyRolesService, RoleHierarchyService],
  exports: [CompanyRolesService, RoleHierarchyService],
})
export class CompanyRolesModule {}
