import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { EmailService } from '../email/email.service';
import { RolesType, InvitationStatus } from '@prisma/client';
import {
  CreateInvitationDto,
  CompanyInvitationResponseDto,
  GetInvitationsQueryDto,
} from './dto';
import { MessageResponseDto } from 'src/dto/responses.dto';

@Injectable()
export class CompanyInvitationsService {
  private readonly logger = new Logger(CompanyInvitationsService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Invite a user to join a company by email
   */
  async createInvitation(
    companyUid: string,
    dto: CreateInvitationDto,
    inviterUid: string,
    inviterRoles: RolesType[],
  ): Promise<CompanyInvitationResponseDto> {
    // Check permissions
    const canInvite =
      inviterRoles.includes(RolesType.COMPANY_OWNER) ||
      inviterRoles.includes(RolesType.COMPANY_ADMIN) ||
      inviterRoles.includes(RolesType.ADMIN);

    if (!canInvite) {
      throw new ForbiddenException(
        'Only Company Owners and Admins can invite team members',
      );
    }

    // Find company
    const company = await this.database.company.findUnique({
      where: { uid: companyUid },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Find inviter
    const inviter = await this.database.user.findUnique({
      where: { uid: inviterUid },
    });

    if (!inviter) {
      throw new NotFoundException('Inviter not found');
    }

    // Check if user with this email already exists in the company
    const existingUser = await this.database.user.findFirst({
      where: {
        email: dto.email,
        companyId: company.id,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email is already a member of the company',
      );
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await this.database.companyInvitation.findFirst({
      where: {
        companyId: company.id,
        email: dto.email,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      throw new ConflictException(
        'A pending invitation already exists for this email',
      );
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.database.companyInvitation.create({
      data: {
        companyId: company.id,
        email: dto.email,
        role: dto.role,
        invitedById: inviter.id,
        expiresAt,
      },
      include: {
        company: true,
        invitedBy: true,
      },
    });

    // TODO: Send invitation email
    this.logger.log(
      `Invitation created for ${dto.email} to join ${company.name} as ${dto.role}`,
    );

    // TODO: In production, send email with invitation link
    // const invitationLink = `${process.env.FRONTEND_URL}/invitations/accept/${invitation.token}`;
    // await this.emailService.sendTeamInvitation(dto.email, company.name, inviter.name, invitation.role, invitationLink);

    return this.mapToResponseDto(invitation);
  }

  /**
   * Get all invitations for a company
   */
  async getCompanyInvitations(
    companyUid: string,
    currentUserRoles: RolesType[],
    query?: GetInvitationsQueryDto,
  ): Promise<CompanyInvitationResponseDto[]> {
    // Check permissions
    const canView =
      currentUserRoles.includes(RolesType.COMPANY_OWNER) ||
      currentUserRoles.includes(RolesType.COMPANY_ADMIN) ||
      currentUserRoles.includes(RolesType.ADMIN);

    if (!canView) {
      throw new ForbiddenException(
        'Only Company Owners and Admins can view invitations',
      );
    }

    // Find company
    const company = await this.database.company.findUnique({
      where: { uid: companyUid },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const limit = query?.limit ? parseInt(query.limit, 10) : 50;
    const skip = query?.skip ? parseInt(query.skip, 10) : 0;

    const invitations = await this.database.companyInvitation.findMany({
      where: {
        companyId: company.id,
        ...(query?.status && { status: query.status }),
      },
      include: {
        company: true,
        invitedBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip,
    });

    return invitations.map((inv) => this.mapToResponseDto(inv));
  }

  /**
   * Cancel an invitation
   */
  async cancelInvitation(
    companyUid: string,
    invitationUid: string,
    currentUserRoles: RolesType[],
  ): Promise<MessageResponseDto> {
    // Check permissions
    const canCancel =
      currentUserRoles.includes(RolesType.COMPANY_OWNER) ||
      currentUserRoles.includes(RolesType.COMPANY_ADMIN) ||
      currentUserRoles.includes(RolesType.ADMIN);

    if (!canCancel) {
      throw new ForbiddenException(
        'Only Company Owners and Admins can cancel invitations',
      );
    }

    // Find invitation
    const invitation = await this.database.companyInvitation.findUnique({
      where: { uid: invitationUid },
      include: { company: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify company matches
    if (invitation.company.uid !== companyUid) {
      throw new BadRequestException('Invitation does not belong to this company');
    }

    // Can only cancel pending invitations
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel invitation with status: ${invitation.status}`,
      );
    }

    // Update status to cancelled
    await this.database.companyInvitation.update({
      where: { uid: invitationUid },
      data: { status: InvitationStatus.CANCELLED },
    });

    this.logger.log(`Invitation ${invitationUid} cancelled`);

    return {
      message: 'Invitation cancelled successfully',
    };
  }

  /**
   * Accept an invitation (public endpoint)
   */
  async acceptInvitation(
    token: string,
    userUid: string,
  ): Promise<CompanyInvitationResponseDto> {
    // Find invitation by token
    const invitation = await this.database.companyInvitation.findUnique({
      where: { token },
      include: {
        company: true,
        invitedBy: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Check if invitation is still valid
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `Invitation has already been ${invitation.status.toLowerCase()}`,
      );
    }

    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      await this.database.companyInvitation.update({
        where: { uid: invitation.uid },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('Invitation has expired');
    }

    // Find user
    const user = await this.database.user.findUnique({
      where: { uid: userUid },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify email matches
    if (user.email !== invitation.email) {
      throw new ForbiddenException(
        'Invitation email does not match your account email',
      );
    }

    // Check if user already belongs to another company
    if (user.companyId) {
      throw new BadRequestException(
        'You already belong to a company. Please leave your current company first.',
      );
    }

    // Update user with company and role
    await this.database.user.update({
      where: { uid: userUid },
      data: {
        companyId: invitation.companyId,
        roles: [invitation.role],
      },
    });

    // Mark invitation as accepted
    const updatedInvitation = await this.database.companyInvitation.update({
      where: { uid: invitation.uid },
      data: {
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      include: {
        company: true,
        invitedBy: true,
      },
    });

    this.logger.log(
      `User ${user.email} accepted invitation to join ${invitation.company.name}`,
    );

    return this.mapToResponseDto(updatedInvitation);
  }

  /**
   * Map database model to response DTO
   */
  private mapToResponseDto(invitation: any): CompanyInvitationResponseDto {
    return {
      uid: invitation.uid,
      companyUid: invitation.company.uid,
      companyName: invitation.company.name,
      email: invitation.email,
      role: invitation.role,
      invitedByUid: invitation.invitedBy.uid,
      invitedByName: invitation.invitedBy.name,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
      status: invitation.status,
      acceptedAt: invitation.acceptedAt,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
    };
  }
}
