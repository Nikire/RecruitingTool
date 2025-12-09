import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CompanyInvitationsService } from './company-invitations.service';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { RolesType } from '@prisma/client';
import {
  CreateInvitationDto,
  CompanyInvitationResponseDto,
  GetInvitationsQueryDto,
} from './dto';
import { MessageResponseDto } from 'src/dto/responses.dto';

@ApiTags('Company Invitations')
@ApiBearerAuth()
@Controller()
export class CompanyInvitationsController {
  constructor(
    private readonly companyInvitationsService: CompanyInvitationsService,
  ) {}

  /**
   * Invite user by email to join company
   */
  @Post('companies/:companyUid/invitations')
  @Auth([
    RolesType.COMPANY_OWNER,
    RolesType.COMPANY_ADMIN,
    RolesType.ADMIN,
  ])
  @ApiOperation({
    summary: 'Invite user to join company',
    description:
      'Send an invitation to a user by email to join the company. Only Company Owners and Admins can send invitations.',
  })
  @ApiParam({ name: 'companyUid', description: 'Company UID' })
  @ApiResponse({
    status: 201,
    description: 'Invitation created successfully',
    type: CompanyInvitationResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to invite team members',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists in company or pending invitation exists',
  })
  async createInvitation(
    @Param('companyUid') companyUid: string,
    @Body() dto: CreateInvitationDto,
    @CurrentUser('uid') inviterUid: string,
    @CurrentUser('roles') inviterRoles: RolesType[],
  ): Promise<CompanyInvitationResponseDto> {
    return this.companyInvitationsService.createInvitation(
      companyUid,
      dto,
      inviterUid,
      inviterRoles,
    );
  }

  /**
   * Get all invitations for a company
   */
  @Get('companies/:companyUid/invitations')
  @Auth([
    RolesType.COMPANY_OWNER,
    RolesType.COMPANY_ADMIN,
    RolesType.ADMIN,
  ])
  @ApiOperation({
    summary: 'Get company invitations',
    description:
      'Get all invitations for a company. Only Company Owners and Admins can view invitations.',
  })
  @ApiParam({ name: 'companyUid', description: 'Company UID' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit results',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Skip records',
  })
  @ApiResponse({
    status: 200,
    description: 'List of company invitations',
    type: [CompanyInvitationResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to view invitations',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  async getCompanyInvitations(
    @Param('companyUid') companyUid: string,
    @CurrentUser('roles') currentUserRoles: RolesType[],
    @Query() query: GetInvitationsQueryDto,
  ): Promise<CompanyInvitationResponseDto[]> {
    return this.companyInvitationsService.getCompanyInvitations(
      companyUid,
      currentUserRoles,
      query,
    );
  }

  /**
   * Cancel an invitation
   */
  @Delete('companies/:companyUid/invitations/:invitationUid')
  @Auth([
    RolesType.COMPANY_OWNER,
    RolesType.COMPANY_ADMIN,
    RolesType.ADMIN,
  ])
  @ApiOperation({
    summary: 'Cancel invitation',
    description:
      'Cancel a pending invitation. Only Company Owners and Admins can cancel invitations.',
  })
  @ApiParam({ name: 'companyUid', description: 'Company UID' })
  @ApiParam({ name: 'invitationUid', description: 'Invitation UID' })
  @ApiResponse({
    status: 200,
    description: 'Invitation cancelled successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel non-pending invitation',
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to cancel invitations',
  })
  @ApiResponse({
    status: 404,
    description: 'Invitation not found',
  })
  async cancelInvitation(
    @Param('companyUid') companyUid: string,
    @Param('invitationUid') invitationUid: string,
    @CurrentUser('roles') currentUserRoles: RolesType[],
  ): Promise<MessageResponseDto> {
    return this.companyInvitationsService.cancelInvitation(
      companyUid,
      invitationUid,
      currentUserRoles,
    );
  }

  /**
   * Accept invitation (public endpoint with token)
   */
  @Post('invitations/accept/:token')
  @Auth() // Any authenticated user can accept their invitation
  @ApiOperation({
    summary: 'Accept invitation',
    description:
      'Accept an invitation to join a company using the invitation token. User email must match the invited email.',
  })
  @ApiParam({ name: 'token', description: 'Invitation token' })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted successfully',
    type: CompanyInvitationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invitation already processed or expired',
  })
  @ApiResponse({
    status: 403,
    description: 'Email mismatch or user already belongs to a company',
  })
  @ApiResponse({
    status: 404,
    description: 'Invitation not found',
  })
  async acceptInvitation(
    @Param('token') token: string,
    @CurrentUser('uid') userUid: string,
  ): Promise<CompanyInvitationResponseDto> {
    return this.companyInvitationsService.acceptInvitation(token, userUid);
  }
}
