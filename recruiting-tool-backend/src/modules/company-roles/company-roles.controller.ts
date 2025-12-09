import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyRolesService } from './company-roles.service';
import { AssignRoleDto, UpdateRoleDto, CompanyMemberResponseDto } from './dto/company-roles.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { RolesType } from '@prisma/client';
import { MessageResponseDto } from 'src/dto/responses.dto';

@ApiTags('Company Roles')
@ApiBearerAuth()
@Controller('companies/:companyUid/roles')
export class CompanyRolesController {
  constructor(private readonly companyRolesService: CompanyRolesService) {}

  @Get()
  @Auth([RolesType.COMPANY_OWNER, RolesType.COMPANY_ADMIN, RolesType.ADMIN, RolesType.HR_MANAGER])
  @ApiOperation({
    summary: 'Get all company members',
    description: 'Retrieve all members of a company. Accessible by COMPANY_OWNER, COMPANY_ADMIN, and HR_MANAGER.',
  })
  @ApiResponse({
    status: 200,
    description: 'Company members retrieved successfully',
    type: [CompanyMemberResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCompanyMembers(
    @Param('companyUid') companyUid: string,
    @CurrentUser() currentUser: any,
  ): Promise<CompanyMemberResponseDto[]> {
    return this.companyRolesService.getCompanyMembers(companyUid, currentUser.roles);
  }

  @Get('delegatable')
  @Auth([RolesType.COMPANY_OWNER, RolesType.COMPANY_ADMIN, RolesType.ADMIN, RolesType.HR_MANAGER])
  @ApiOperation({
    summary: 'Get roles that can be delegated',
    description: 'Get list of roles that the current user can assign to others based on their role hierarchy.',
  })
  @ApiResponse({
    status: 200,
    description: 'Delegatable roles retrieved successfully',
    type: [String],
  })
  async getDelegatableRoles(@CurrentUser() currentUser: any): Promise<RolesType[]> {
    return this.companyRolesService.getDelegatableRoles(currentUser.roles);
  }

  @Post()
  @Auth([RolesType.COMPANY_OWNER, RolesType.COMPANY_ADMIN, RolesType.ADMIN, RolesType.HR_MANAGER])
  @ApiOperation({
    summary: 'Assign role to user',
    description: 'Assign one or more roles to a user in the company. Role assignment is restricted by role hierarchy.',
  })
  @ApiResponse({
    status: 201,
    description: 'Role assigned successfully',
    type: CompanyMemberResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions to assign role' })
  @ApiResponse({ status: 404, description: 'Company or user not found' })
  async assignRole(
    @Param('companyUid') companyUid: string,
    @Body() assignRoleDto: AssignRoleDto,
    @CurrentUser() currentUser: any,
  ): Promise<CompanyMemberResponseDto> {
    return this.companyRolesService.assignRole(companyUid, assignRoleDto, currentUser.roles);
  }

  @Patch(':userUid')
  @Auth([RolesType.COMPANY_OWNER, RolesType.COMPANY_ADMIN, RolesType.ADMIN, RolesType.HR_MANAGER])
  @ApiOperation({
    summary: "Update user's roles",
    description: "Update a user's roles in the company. Role assignment is restricted by role hierarchy.",
  })
  @ApiResponse({
    status: 200,
    description: "User's roles updated successfully",
    type: CompanyMemberResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions to update role' })
  @ApiResponse({ status: 404, description: 'Company or user not found' })
  async updateUserRole(
    @Param('companyUid') companyUid: string,
    @Param('userUid') userUid: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() currentUser: any,
  ): Promise<CompanyMemberResponseDto> {
    return this.companyRolesService.updateUserRole(companyUid, userUid, updateRoleDto, currentUser.roles);
  }

  @Delete(':userUid')
  @Auth([RolesType.COMPANY_OWNER, RolesType.COMPANY_ADMIN, RolesType.ADMIN])
  @ApiOperation({
    summary: 'Remove user from company',
    description: 'Remove a user from the company. Only COMPANY_OWNER and COMPANY_ADMIN can perform this action.',
  })
  @ApiResponse({
    status: 200,
    description: 'User removed from company successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions to remove user' })
  @ApiResponse({ status: 404, description: 'Company or user not found' })
  async removeUserFromCompany(
    @Param('companyUid') companyUid: string,
    @Param('userUid') userUid: string,
    @CurrentUser() currentUser: any,
  ): Promise<MessageResponseDto> {
    return this.companyRolesService.removeUserFromCompany(companyUid, userUid, currentUser.roles);
  }
}
