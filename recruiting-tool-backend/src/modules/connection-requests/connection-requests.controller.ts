import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ConnectionRequestsService } from './connection-requests.service';
import { AuthGuard } from '../shared/modules/auth/guards/auth.guard';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { RolesType } from '@prisma/client';
import {
  CreateConnectionRequestDto,
  ApproveConnectionRequestDto,
  DenyConnectionRequestDto,
  ConnectionRequestResponseDto,
  GetConnectionRequestsQueryDto,
} from './dto';

@ApiTags('Connection Requests')
@Controller('connection-requests')
export class ConnectionRequestsController {
  constructor(
    private readonly connectionRequestsService: ConnectionRequestsService,
  ) {}

  /**
   * Submit a request to join a company
   */
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit request to join a company' })
  @ApiResponse({
    status: 201,
    description: 'Connection request created successfully',
    type: ConnectionRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User already belongs to a company',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Pending or approved request already exists',
  })
  async create(
    @CurrentUser('uid') userUid: string,
    @Body() dto: CreateConnectionRequestDto,
  ): Promise<ConnectionRequestResponseDto> {
    return this.connectionRequestsService.create(userUid, dto);
  }

  /**
   * Get my connection requests
   */
  @Get('my-requests')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my connection requests' })
  @ApiResponse({
    status: 200,
    description: 'List of user connection requests',
    type: [ConnectionRequestResponseDto],
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results' })
  @ApiQuery({ name: 'skip', required: false, description: 'Skip records' })
  async getMyRequests(
    @CurrentUser('uid') userUid: string,
    @Query() query: GetConnectionRequestsQueryDto,
  ): Promise<ConnectionRequestResponseDto[]> {
    return this.connectionRequestsService.getMyRequests(userUid, query);
  }

  /**
   * Get pending requests for a company (for company admins/owners)
   */
  @Get('companies/:companyUid')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get connection requests for a company (admin/owner only)',
  })
  @ApiParam({ name: 'companyUid', description: 'Company UID' })
  @ApiResponse({
    status: 200,
    description: 'List of company connection requests',
    type: [ConnectionRequestResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'User is not a company owner or admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results' })
  @ApiQuery({ name: 'skip', required: false, description: 'Skip records' })
  async getCompanyRequests(
    @Param('companyUid') companyUid: string,
    @CurrentUser('roles') currentUserRoles: RolesType[],
    @Query() query: GetConnectionRequestsQueryDto,
  ): Promise<ConnectionRequestResponseDto[]> {
    return this.connectionRequestsService.getCompanyRequests(
      companyUid,
      currentUserRoles,
      query,
    );
  }

  /**
   * Approve a connection request
   */
  @Patch(':uid/approve')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a connection request (admin/owner only)' })
  @ApiParam({ name: 'uid', description: 'Connection request UID' })
  @ApiResponse({
    status: 200,
    description: 'Connection request approved',
    type: ConnectionRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Request already processed',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not a company owner or admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Connection request not found',
  })
  async approve(
    @Param('uid') requestUid: string,
    @CurrentUser('uid') reviewerUid: string,
    @CurrentUser('roles') currentUserRoles: RolesType[],
    @Body() dto: ApproveConnectionRequestDto,
  ): Promise<ConnectionRequestResponseDto> {
    return this.connectionRequestsService.approve(
      requestUid,
      reviewerUid,
      currentUserRoles,
      dto,
    );
  }

  /**
   * Deny a connection request
   */
  @Patch(':uid/deny')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deny a connection request (admin/owner only)' })
  @ApiParam({ name: 'uid', description: 'Connection request UID' })
  @ApiResponse({
    status: 200,
    description: 'Connection request denied',
    type: ConnectionRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Request already processed',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not a company owner or admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Connection request not found',
  })
  async deny(
    @Param('uid') requestUid: string,
    @CurrentUser('uid') reviewerUid: string,
    @CurrentUser('roles') currentUserRoles: RolesType[],
    @Body() dto: DenyConnectionRequestDto,
  ): Promise<ConnectionRequestResponseDto> {
    return this.connectionRequestsService.deny(
      requestUid,
      reviewerUid,
      currentUserRoles,
      dto,
    );
  }

  /**
   * Cancel a connection request (by requester)
   */
  @Delete(':uid')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a connection request (requester only)' })
  @ApiParam({ name: 'uid', description: 'Connection request UID' })
  @ApiResponse({
    status: 200,
    description: 'Connection request cancelled',
  })
  @ApiResponse({
    status: 400,
    description: 'Request already processed',
  })
  @ApiResponse({
    status: 403,
    description: 'User can only cancel their own requests',
  })
  @ApiResponse({
    status: 404,
    description: 'Connection request not found',
  })
  async cancel(
    @Param('uid') requestUid: string,
    @CurrentUser('uid') userUid: string,
  ): Promise<{ message: string }> {
    return this.connectionRequestsService.cancel(requestUid, userUid);
  }
}
