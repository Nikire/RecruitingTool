import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RoleHierarchyService } from './services/role-hierarchy.service';
import { AssignRoleDto, UpdateRoleDto, CompanyMemberResponseDto } from './dto/company-roles.dto';
import { RolesType, NotificationType } from '@prisma/client';
import { MessageResponseDto } from 'src/dto/responses.dto';

@Injectable()
export class CompanyRolesService {
  private readonly logger = new Logger(CompanyRolesService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly roleHierarchyService: RoleHierarchyService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Get all members of a company
   */
  async getCompanyMembers(companyUid: string, currentUserRoles: RolesType[]): Promise<CompanyMemberResponseDto[]> {
    try {
      // Find the company
      const company = await this.databaseService.company.findUnique({
        where: { uid: companyUid },
      });

      if (!company) {
        throw new NotFoundException(`Company with UID ${companyUid} not found`);
      }

      // Get all users in the company
      const users = await this.databaseService.user.findMany({
        where: {
          companyId: company.id,
        },
        orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      });

      return users.map((user) => this.mapToCompanyMemberDto(user));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get company members: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to get company members: ${error.message}`);
    }
  }

  /**
   * Assign role(s) to a user in a company
   */
  async assignRole(companyUid: string, assignRoleDto: AssignRoleDto, currentUserRoles: RolesType[]): Promise<CompanyMemberResponseDto> {
    try {
      // Find the company
      const company = await this.databaseService.company.findUnique({
        where: { uid: companyUid },
      });

      if (!company) {
        throw new NotFoundException(`Company with UID ${companyUid} not found`);
      }

      // Find the target user
      const targetUser = await this.databaseService.user.findUnique({
        where: { uid: assignRoleDto.userUid },
      });

      if (!targetUser) {
        throw new NotFoundException(`User with UID ${assignRoleDto.userUid} not found`);
      }

      // Check if user belongs to the company
      if (targetUser.companyId !== company.id) {
        throw new BadRequestException(`User does not belong to this company`);
      }

      // Validate permission to assign roles
      const validationError = this.roleHierarchyService.validateRoleAssignment(currentUserRoles, assignRoleDto.roles);
      if (validationError) {
        throw new ForbiddenException(validationError);
      }

      // Update user roles
      const updatedUser = await this.databaseService.user.update({
        where: { uid: assignRoleDto.userUid },
        data: {
          roles: assignRoleDto.roles,
        },
      });

      return this.mapToCompanyMemberDto(updatedUser);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to assign role: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to assign role: ${error.message}`);
    }
  }

  /**
   * Update a user's roles in a company
   */
  async updateUserRole(companyUid: string, userUid: string, updateRoleDto: UpdateRoleDto, currentUserRoles: RolesType[]): Promise<CompanyMemberResponseDto> {
    try {
      // Find the company
      const company = await this.databaseService.company.findUnique({
        where: { uid: companyUid },
      });

      if (!company) {
        throw new NotFoundException(`Company with UID ${companyUid} not found`);
      }

      // Find the target user
      const targetUser = await this.databaseService.user.findUnique({
        where: { uid: userUid },
      });

      if (!targetUser) {
        throw new NotFoundException(`User with UID ${userUid} not found`);
      }

      // Check if user belongs to the company
      if (targetUser.companyId !== company.id) {
        throw new BadRequestException(`User does not belong to this company`);
      }

      // Check if current user can manage this user (must be able to delegate all current and new roles)
      const canManageCurrent = this.roleHierarchyService.canManageUser(currentUserRoles, targetUser.roles);
      if (!canManageCurrent) {
        throw new ForbiddenException(`You do not have permission to manage this user`);
      }

      // Validate permission to assign new roles
      const validationError = this.roleHierarchyService.validateRoleAssignment(currentUserRoles, updateRoleDto.roles);
      if (validationError) {
        throw new ForbiddenException(validationError);
      }

      // Store old roles for notification
      const oldRoles = targetUser.roles;

      // Update user roles
      const updatedUser = await this.databaseService.user.update({
        where: { uid: userUid },
        data: {
          roles: updateRoleDto.roles,
        },
      });

      // Notify the user about role change
      try {
        await this.notificationsService.create({
          userUid: targetUser.uid,
          type: NotificationType.TEAM_ROLE_CHANGED,
          title: 'Role Changed',
          message: `Your role has been updated at ${company.name}. New role${updateRoleDto.roles.length > 1 ? 's' : ''}: ${updateRoleDto.roles.join(', ')}.`,
          metadata: {
            companyUid: company.uid,
            companyName: company.name,
            oldRoles,
            newRoles: updateRoleDto.roles,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to create notification for role change: ${error.message}`);
        // Don't fail the role update if notification fails
      }

      return this.mapToCompanyMemberDto(updatedUser);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to update user role: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to update user role: ${error.message}`);
    }
  }

  /**
   * Remove a user from a company
   */
  async removeUserFromCompany(companyUid: string, userUid: string, currentUserRoles: RolesType[]): Promise<MessageResponseDto> {
    try {
      // Find the company
      const company = await this.databaseService.company.findUnique({
        where: { uid: companyUid },
      });

      if (!company) {
        throw new NotFoundException(`Company with UID ${companyUid} not found`);
      }

      // Find the target user
      const targetUser = await this.databaseService.user.findUnique({
        where: { uid: userUid },
      });

      if (!targetUser) {
        throw new NotFoundException(`User with UID ${userUid} not found`);
      }

      // Check if user belongs to the company
      if (targetUser.companyId !== company.id) {
        throw new BadRequestException(`User does not belong to this company`);
      }

      // Check if current user can manage this user
      const canManage = this.roleHierarchyService.canManageUser(currentUserRoles, targetUser.roles);
      if (!canManage) {
        throw new ForbiddenException(`You do not have permission to remove this user`);
      }

      // Remove user from company (set companyId to null)
      await this.databaseService.user.update({
        where: { uid: userUid },
        data: {
          companyId: null,
          roles: [RolesType.USER], // Reset to basic user role
        },
      });

      // Notify the user about removal
      try {
        await this.notificationsService.create({
          userUid: targetUser.uid,
          type: NotificationType.TEAM_MEMBER_REMOVED,
          title: 'Removed from Team',
          message: `You have been removed from ${company.name}.`,
          metadata: {
            companyUid: company.uid,
            companyName: company.name,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to create notification for team member removal: ${error.message}`);
        // Don't fail the removal if notification fails
      }

      return {
        message: `User ${targetUser.name} removed from company successfully`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to remove user from company: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to remove user from company: ${error.message}`);
    }
  }

  /**
   * Get roles that the current user can delegate
   */
  getDelegatableRoles(currentUserRoles: RolesType[]): RolesType[] {
    return this.roleHierarchyService.getDelegatableRoles(currentUserRoles);
  }

  /**
   * Map User entity to CompanyMemberResponseDto
   */
  private mapToCompanyMemberDto(user: any): CompanyMemberResponseDto {
    return {
      uid: user.uid,
      name: user.name,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
      position: user.position,
      department: user.department,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
    };
  }
}
