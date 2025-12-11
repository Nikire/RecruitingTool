import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, ConflictException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RolesType, NotificationType } from '@prisma/client';
import { CreateConnectionRequestDto, ApproveConnectionRequestDto, DenyConnectionRequestDto, ConnectionRequestResponseDto, GetConnectionRequestsQueryDto } from './dto';

@Injectable()
export class ConnectionRequestsService {
  private readonly logger = new Logger(ConnectionRequestsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Submit a request to join a company
   */
  async create(userUid: string, dto: CreateConnectionRequestDto): Promise<ConnectionRequestResponseDto> {
    try {
      // Find user
      const user = await this.databaseService.user.findUnique({
        where: { uid: userUid },
      });

      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      // Check if user already belongs to a company
      if (user.companyId) {
        throw new BadRequestException('You already belong to a company. Please leave your current company before requesting to join another.');
      }

      // Find company
      const company = await this.databaseService.company.findUnique({
        where: { uid: dto.companyUid },
        include: {
          users: {
            where: {
              OR: [{ roles: { has: RolesType.COMPANY_OWNER } }, { roles: { has: RolesType.COMPANY_ADMIN } }],
            },
            take: 1, // Get at least one admin to notify
          },
        },
      });

      if (!company) {
        throw new NotFoundException(`Company not found`);
      }

      // Check if user already has a pending request for this company
      const existingRequest = await this.databaseService.connectionRequest.findUnique({
        where: {
          userId_companyId: {
            userId: user.id,
            companyId: company.id,
          },
        },
      });

      if (existingRequest) {
        if (existingRequest.status === 'PENDING') {
          throw new ConflictException('You already have a pending request for this company');
        } else if (existingRequest.status === 'APPROVED') {
          throw new ConflictException('You have already been approved for this company');
        } else if (existingRequest.status === 'DENIED') {
          // Allow re-requesting after denial
          // Delete old denied request and create new one
          await this.databaseService.connectionRequest.delete({
            where: { id: existingRequest.id },
          });
        }
      }

      // Create connection request
      const connectionRequest = await this.databaseService.connectionRequest.create({
        data: {
          userId: user.id,
          companyId: company.id,
          requestedRole: dto.requestedRole || RolesType.HR,
          message: dto.message,
          status: 'PENDING',
        },
        include: {
          user: {
            select: { uid: true, name: true, email: true },
          },
          company: {
            select: { uid: true, name: true },
          },
        },
      });

      // Notify company admins/owners
      if (company.users.length > 0) {
        for (const admin of company.users) {
          await this.notificationsService.create({
            userUid: admin.uid,
            type: NotificationType.SYSTEM,
            title: 'New Connection Request',
            message: `${user.name} (${user.email}) has requested to join ${company.name} as ${dto.requestedRole || 'HR'}`,
            metadata: {
              connectionRequestUid: connectionRequest.uid,
              requesterUid: user.uid,
              companyUid: company.uid,
            },
          });
        }
      }

      this.logger.log(`User ${userUid} created connection request to company ${dto.companyUid}`);

      return this.mapToResponseDto(connectionRequest);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to create connection request: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to create connection request: ${error.message}`);
    }
  }

  /**
   * Get connection requests for a user
   */
  async getMyRequests(userUid: string, query: GetConnectionRequestsQueryDto): Promise<ConnectionRequestResponseDto[]> {
    try {
      const user = await this.databaseService.user.findUnique({
        where: { uid: userUid },
      });

      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      const where: any = { userId: user.id };
      if (query.status) {
        where.status = query.status;
      }

      const requests = await this.databaseService.connectionRequest.findMany({
        where,
        include: {
          user: {
            select: { uid: true, name: true, email: true },
          },
          company: {
            select: { uid: true, name: true },
          },
          reviewedBy: {
            select: { uid: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(query.limit || 50, 100),
        skip: query.skip || 0,
      });

      return requests.map(this.mapToResponseDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get user requests: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to get user requests: ${error.message}`);
    }
  }

  /**
   * Get pending requests for a company (for admins/owners)
   */
  async getCompanyRequests(companyUid: string, currentUserRoles: RolesType[], query: GetConnectionRequestsQueryDto): Promise<ConnectionRequestResponseDto[]> {
    try {
      // Check if user is company owner or admin
      if (!currentUserRoles.includes(RolesType.COMPANY_OWNER) && !currentUserRoles.includes(RolesType.COMPANY_ADMIN)) {
        throw new ForbiddenException('You must be a company owner or admin to view connection requests');
      }

      const company = await this.databaseService.company.findUnique({
        where: { uid: companyUid },
      });

      if (!company) {
        throw new NotFoundException(`Company not found`);
      }

      const where: any = { companyId: company.id };
      if (query.status) {
        where.status = query.status;
      }

      const requests = await this.databaseService.connectionRequest.findMany({
        where,
        include: {
          user: {
            select: { uid: true, name: true, email: true },
          },
          company: {
            select: { uid: true, name: true },
          },
          reviewedBy: {
            select: { uid: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(query.limit || 50, 100),
        skip: query.skip || 0,
      });

      return requests.map(this.mapToResponseDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get company requests: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to get company requests: ${error.message}`);
    }
  }

  /**
   * Approve a connection request
   */
  async approve(requestUid: string, reviewerUid: string, currentUserRoles: RolesType[], dto: ApproveConnectionRequestDto): Promise<ConnectionRequestResponseDto> {
    try {
      // Check if user is company owner or admin
      if (!currentUserRoles.includes(RolesType.COMPANY_OWNER) && !currentUserRoles.includes(RolesType.COMPANY_ADMIN)) {
        throw new ForbiddenException('You must be a company owner or admin to approve requests');
      }

      const reviewer = await this.databaseService.user.findUnique({
        where: { uid: reviewerUid },
      });

      if (!reviewer) {
        throw new NotFoundException(`Reviewer not found`);
      }

      const request = await this.databaseService.connectionRequest.findUnique({
        where: { uid: requestUid },
        include: {
          user: true,
          company: true,
        },
      });

      if (!request) {
        throw new NotFoundException(`Connection request not found`);
      }

      if (request.status !== 'PENDING') {
        throw new BadRequestException(`Connection request has already been ${request.status.toLowerCase()}`);
      }

      // Check if reviewer belongs to the same company
      if (reviewer.companyId !== request.companyId) {
        throw new ForbiddenException('You can only approve requests for your own company');
      }

      // Determine which role to assign (use provided or requested)
      const roleToAssign = dto.assignedRole || request.requestedRole;

      // Update connection request
      const updatedRequest = await this.databaseService.connectionRequest.update({
        where: { uid: requestUid },
        data: {
          status: 'APPROVED',
          reviewedById: reviewer.id,
          reviewedAt: new Date(),
          reviewNote: dto.reviewNote,
        },
        include: {
          user: {
            select: { uid: true, name: true, email: true },
          },
          company: {
            select: { uid: true, name: true },
          },
          reviewedBy: {
            select: { uid: true, name: true },
          },
        },
      });

      // Add user to company with requested role
      await this.databaseService.user.update({
        where: { id: request.userId },
        data: {
          companyId: request.companyId,
          roles: [roleToAssign],
        },
      });

      // Notify requester
      await this.notificationsService.create({
        userUid: request.user.uid,
        type: NotificationType.SYSTEM,
        title: 'Connection Request Approved',
        message: `Your request to join ${request.company.name} has been approved! You have been assigned the role of ${roleToAssign}.`,
        metadata: {
          connectionRequestUid: requestUid,
          companyUid: request.company.uid,
          assignedRole: roleToAssign,
        },
      });

      this.logger.log(`Connection request ${requestUid} approved by ${reviewerUid}`);

      return this.mapToResponseDto(updatedRequest);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to approve connection request: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to approve connection request: ${error.message}`);
    }
  }

  /**
   * Deny a connection request
   */
  async deny(requestUid: string, reviewerUid: string, currentUserRoles: RolesType[], dto: DenyConnectionRequestDto): Promise<ConnectionRequestResponseDto> {
    try {
      // Check if user is company owner or admin
      if (!currentUserRoles.includes(RolesType.COMPANY_OWNER) && !currentUserRoles.includes(RolesType.COMPANY_ADMIN)) {
        throw new ForbiddenException('You must be a company owner or admin to deny requests');
      }

      const reviewer = await this.databaseService.user.findUnique({
        where: { uid: reviewerUid },
      });

      if (!reviewer) {
        throw new NotFoundException(`Reviewer not found`);
      }

      const request = await this.databaseService.connectionRequest.findUnique({
        where: { uid: requestUid },
        include: {
          user: true,
          company: true,
        },
      });

      if (!request) {
        throw new NotFoundException(`Connection request not found`);
      }

      if (request.status !== 'PENDING') {
        throw new BadRequestException(`Connection request has already been ${request.status.toLowerCase()}`);
      }

      // Check if reviewer belongs to the same company
      if (reviewer.companyId !== request.companyId) {
        throw new ForbiddenException('You can only deny requests for your own company');
      }

      // Update connection request
      const updatedRequest = await this.databaseService.connectionRequest.update({
        where: { uid: requestUid },
        data: {
          status: 'DENIED',
          reviewedById: reviewer.id,
          reviewedAt: new Date(),
          reviewNote: dto.reviewNote,
        },
        include: {
          user: {
            select: { uid: true, name: true, email: true },
          },
          company: {
            select: { uid: true, name: true },
          },
          reviewedBy: {
            select: { uid: true, name: true },
          },
        },
      });

      // Notify requester
      await this.notificationsService.create({
        userUid: request.user.uid,
        type: NotificationType.SYSTEM,
        title: 'Connection Request Denied',
        message: `Your request to join ${request.company.name} has been denied. Reason: ${dto.reviewNote}`,
        metadata: {
          connectionRequestUid: requestUid,
          companyUid: request.company.uid,
        },
      });

      this.logger.log(`Connection request ${requestUid} denied by ${reviewerUid}`);

      return this.mapToResponseDto(updatedRequest);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to deny connection request: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to deny connection request: ${error.message}`);
    }
  }

  /**
   * Cancel a connection request (by requester)
   */
  async cancel(requestUid: string, userUid: string): Promise<{ message: string }> {
    try {
      const user = await this.databaseService.user.findUnique({
        where: { uid: userUid },
      });

      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      const request = await this.databaseService.connectionRequest.findUnique({
        where: { uid: requestUid },
      });

      if (!request) {
        throw new NotFoundException(`Connection request not found`);
      }

      // Check if request belongs to user
      if (request.userId !== user.id) {
        throw new ForbiddenException('You can only cancel your own connection requests');
      }

      if (request.status !== 'PENDING') {
        throw new BadRequestException(`Cannot cancel a request that has already been ${request.status.toLowerCase()}`);
      }

      // Delete the request
      await this.databaseService.connectionRequest.delete({
        where: { uid: requestUid },
      });

      this.logger.log(`Connection request ${requestUid} cancelled by ${userUid}`);

      return { message: 'Connection request cancelled successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to cancel connection request: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to cancel connection request: ${error.message}`);
    }
  }

  /**
   * Map ConnectionRequest to ResponseDto
   */
  private mapToResponseDto(request: any): ConnectionRequestResponseDto {
    return {
      uid: request.uid,
      userUid: request.user.uid,
      userName: request.user.name,
      userEmail: request.user.email,
      companyUid: request.company.uid,
      companyName: request.company.name,
      requestedRole: request.requestedRole,
      status: request.status,
      message: request.message,
      reviewedByUid: request.reviewedBy?.uid,
      reviewedByName: request.reviewedBy?.name,
      reviewedAt: request.reviewedAt?.toISOString(),
      reviewNote: request.reviewNote,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    };
  }
}
