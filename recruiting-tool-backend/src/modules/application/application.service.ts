import { Injectable, NotFoundException, BadRequestException, ConflictException, HttpException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../shared/modules/database/database.service';
import { ApplicationMapper, includeApplication } from './entities/application.entity';
import { ApplicationResponseDto, CreateApplicationDto, UpdateApplicationDto, ApplicationFilterDto } from './dto/application.dto';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { ApplicationStatus, EmailTemplateType, StageStatus, User, NotificationType, Prisma } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { getUserCompanyId, verifyCompanyAccess } from 'src/utils/company-access.helper';
import { EntityNotFoundException } from 'src/common/exceptions';
import { SseService } from '../sse/sse.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailTemplatesService } from '../email-templates/email-templates.service';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    private databaseService: DatabaseService,
    private emailService: EmailService,
    private sseService: SseService,
    private configService: ConfigService,
    private auditLogService: AuditLogService,
    private notificationsService: NotificationsService,
    private emailTemplatesService: EmailTemplatesService,
  ) {}

  async create(createApplicationDto: CreateApplicationDto): Promise<ApplicationResponseDto> {
    try {
      const jobPosition = await this.databaseService.jobPosition.findUnique({
        where: { uid: createApplicationDto.jobPositionUid },
        include: { company: true },
      });

      if (!jobPosition) {
        throw new NotFoundException(`Job position ${createApplicationDto.jobPositionUid} not found`);
      }

      if (jobPosition.status !== 'OPEN') {
        throw new BadRequestException('This job position is not accepting applications');
      }

      let resumeFileId: number | undefined = undefined;
      if (createApplicationDto.resumeFileUid) {
        const resumeFile = await this.databaseService.fileUpload.findUnique({
          where: { uid: createApplicationDto.resumeFileUid },
        });

        if (!resumeFile) {
          throw new NotFoundException(`Resume file ${createApplicationDto.resumeFileUid} not found`);
        }

        resumeFileId = resumeFile.id;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { jobPositionUid, resumeFileUid, ...applicationData } = createApplicationDto;

      const application = await this.databaseService.application.create({
        data: {
          ...applicationData,
          jobPositionId: jobPosition.id,
          resumeFileId,
          status: ApplicationStatus.PENDING,
        },
        include: includeApplication,
      });

      // Send confirmation email to applicant
      try {
        await this.emailService.sendApplicationConfirmation(application.applicantEmail, application.applicantName, jobPosition.title, application.uid, jobPosition.company?.name);
        this.logger.log(`Confirmation email sent to ${application.applicantEmail} for application ${application.uid}`);
      } catch (error) {
        this.logger.error(`Failed to send confirmation email for application ${application.uid}: ${error.message}`);
      }

      // Send notification to HR
      try {
        // Use configured HR email or fallback to first HR user
        const hrEmail = this.configService.get<string>('HR_NOTIFICATION_EMAIL');

        if (hrEmail && hrEmail !== 'hr@company.com') {
          // Use configured email
          await this.emailService.sendNewApplicationNotification(hrEmail, application.applicantName, jobPosition.title, application.uid);
          this.logger.log(`HR notification sent to ${hrEmail} for application ${application.uid}`);
        } else {
          // Fallback: find first HR user in database
          const hrUsers = await this.databaseService.user.findMany({
            where: {
              roles: { has: 'HR' },
            },
            take: 1,
          });

          if (hrUsers.length > 0) {
            await this.emailService.sendNewApplicationNotification(hrUsers[0].email, application.applicantName, jobPosition.title, application.uid);
            this.logger.log(`HR notification sent to ${hrUsers[0].email} for application ${application.uid}`);
          } else {
            this.logger.warn(`No HR users found to notify for application ${application.uid}`);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to send HR notification for application ${application.uid}: ${error.message}`);
      }

      // Emit SSE event for new application
      this.sseService.emitNewApplication(
        application.uid,
        application.applicantName,
        application.applicantEmail,
        jobPosition.uid,
        jobPosition.title,
        new Date().toISOString(),
        undefined, // userUid - send to all users
        jobPosition.company?.uid, // companyUid - filter by company
      );

      // Create notification for HR users about new application
      const hrUsers = await this.databaseService.user.findMany({
        where: {
          companyId: jobPosition.companyId,
          roles: { hasSome: ['HR', 'HR_MANAGER', 'RECRUITER'] },
        },
      });

      for (const hrUser of hrUsers) {
        try {
          await this.notificationsService.create({
            userUid: hrUser.uid,
            type: NotificationType.APPLICATION_RECEIVED,
            title: 'New Application Received',
            message: `${application.applicantName} applied for ${jobPosition.title}`,
            metadata: {
              applicationUid: application.uid,
              applicantName: application.applicantName,
              applicantEmail: application.applicantEmail,
              jobPositionUid: jobPosition.uid,
              jobPositionTitle: jobPosition.title,
            },
          });
        } catch (error) {
          this.logger.error(`Failed to create notification for user ${hrUser.uid}: ${error.message}`);
        }
      }

      return ApplicationMapper(application);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('You have already applied to this position');
      }
      throw new InternalServerErrorException(`Failed to create: ${error.message}`);
    }
  }

  async findAll(filterDto: ApplicationFilterDto, user: User): Promise<ApplicationResponseDto[]> {
    try {
      const where: any = { deletedAt: null };

      if (filterDto.jobPositionUid) {
        const jobPosition = await this.databaseService.jobPosition.findUnique({
          where: { uid: filterDto.jobPositionUid },
        });

        if (!jobPosition) {
          throw new NotFoundException(`Job position ${filterDto.jobPositionUid} not found`);
        }

        where.jobPositionId = jobPosition.id;
      }

      if (filterDto.status) {
        where.status = filterDto.status;
      }

      // Add company filter for HR and USER roles (filter by job position's company)
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        where.jobPosition = {
          companyId: userCompanyId,
        };
      }

      const applications = await this.databaseService.application.findMany({
        where,
        include: includeApplication,
        orderBy: {
          appliedAt: 'desc',
        },
      });

      return applications.map(ApplicationMapper);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find all: ${error.message}`);
    }
  }

  async findOne(uid: string, user?: User): Promise<ApplicationResponseDto> {
    try {
      const application = await this.databaseService.application.findFirst({
        where: { uid, deletedAt: null },
        include: includeApplication,
      });

      if (!application) {
        throw new EntityNotFoundException('Application', uid);
      }

      // Verify company access if user is provided (through job position)
      if (user) {
        verifyCompanyAccess(user, application.jobPosition.companyId);
      }

      return ApplicationMapper(application);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find one: ${error.message}`);
    }
  }

  async update(uid: string, updateApplicationDto: UpdateApplicationDto, reviewerUid: string, user: User): Promise<ApplicationResponseDto> {
    try {
      const application = await this.databaseService.application.findUnique({
        where: { uid },
        include: { jobPosition: true },
      });

      if (!application) {
        throw new EntityNotFoundException('Application', uid);
      }

      // Verify company access before update (through job position)
      verifyCompanyAccess(user, application.jobPosition.companyId);

      const reviewer = await this.databaseService.user.findUnique({
        where: { uid: reviewerUid },
      });

      if (!reviewer) {
        throw new NotFoundException(`Reviewer ${reviewerUid} not found`);
      }

      const oldStatus = application.status;
      const updateData: any = {
        ...updateApplicationDto,
      };

      if (updateApplicationDto.status) {
        updateData.reviewedAt = new Date();
        updateData.reviewedById = reviewer.id;
      }

      const updatedApplication = await this.databaseService.application.update({
        where: { uid },
        data: updateData,
        include: includeApplication,
      });

      // Send status change email if status changed
      if (updateApplicationDto.status && updateApplicationDto.status !== oldStatus) {
        this.logger.log(`Application status changed from ${oldStatus} to ${updateApplicationDto.status} for ${updatedApplication.uid}`);
        await this.sendStatusChangeEmail(
          updatedApplication.applicantEmail,
          updatedApplication.applicantName,
          application.jobPosition.title,
          updatedApplication.uid,
          oldStatus,
          updateApplicationDto.status,
          application.jobPosition.companyId,
        );

        // Create notification for HR users about application status change
        const hrUsers = await this.databaseService.user.findMany({
          where: {
            companyId: application.jobPosition.companyId,
            roles: { hasSome: ['HR', 'HR_MANAGER', 'RECRUITER'] },
          },
        });

        for (const hrUser of hrUsers) {
          try {
            await this.notificationsService.create({
              userUid: hrUser.uid,
              type: NotificationType.APPLICATION_STATUS,
              title: 'Application Status Changed',
              message: `Application from ${updatedApplication.applicantName} for ${application.jobPosition.title} is now ${updateApplicationDto.status}`,
              metadata: {
                applicationUid: updatedApplication.uid,
                applicantName: updatedApplication.applicantName,
                applicantEmail: updatedApplication.applicantEmail,
                jobPositionUid: application.jobPosition.uid,
                jobPositionTitle: application.jobPosition.title,
                oldStatus,
                newStatus: updateApplicationDto.status,
              },
            });
          } catch (error) {
            this.logger.error(`Failed to create notification for user ${hrUser.uid}: ${error.message}`);
          }
        }
      }

      return ApplicationMapper(updatedApplication);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to update: ${error.message}`);
    }
  }

  /**
   * Map application status to the corresponding EmailTemplateType string for DB template lookup.
   * Returns the string key of the enum value so the lookup works even before Prisma client regeneration.
   */
  private statusToTemplateType(status: ApplicationStatus): string | null {
    switch (status) {
      case ApplicationStatus.REVIEWED:
        // APPLICATION_UNDER_REVIEW is a new enum value — use string to avoid Prisma client version mismatch
        return 'APPLICATION_UNDER_REVIEW';
      case ApplicationStatus.ACCEPTED:
        return EmailTemplateType.APPLICATION_SHORTLISTED;
      case ApplicationStatus.REJECTED:
        return EmailTemplateType.APPLICATION_REJECTED;
      default:
        return null;
    }
  }

  private async sendStatusChangeEmail(
    email: string,
    name: string,
    jobTitle: string,
    applicationUid: string,
    oldStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
    companyId?: number,
  ): Promise<void> {
    try {
      // Attempt to use a company-specific editable DB template first
      if (companyId) {
        const templateType = this.statusToTemplateType(newStatus);
        if (templateType) {
          const companyTemplate = await this.emailTemplatesService.findByTypeAndCompany(templateType, companyId).catch(() => null);
          if (companyTemplate) {
            // Fetch the company name for template variables
            let companyName = '';
            try {
              const company = await this.databaseService.company.findUnique({ where: { id: companyId } });
              companyName = company?.name ?? '';
            } catch {
              // non-critical — continue without company name
            }

            await this.emailService.sendEmailFromTemplate(email, name, companyTemplate.uid, {
              candidateName: name,
              positionTitle: jobTitle,
              companyName,
              applicationUid,
            });
            this.logger.log(`Sent ${newStatus} status email via company template ${companyTemplate.uid} to ${email} for application ${applicationUid}`);
            return;
          }
        }
      }

      // Fall back to hardcoded templates
      switch (newStatus) {
        case ApplicationStatus.REVIEWED:
          await this.emailService.sendApplicationUnderReview(email, name, jobTitle, applicationUid);
          this.logger.log(`Sent REVIEWED status email (hardcoded) to ${email} for application ${applicationUid}`);
          break;
        case ApplicationStatus.ACCEPTED:
          await this.emailService.sendApplicationAcceptance(email, name, jobTitle);
          this.logger.log(`Sent ACCEPTED status email (hardcoded) to ${email} for application ${applicationUid}`);
          break;
        case ApplicationStatus.REJECTED:
          await this.emailService.sendApplicationRejection(email, name, jobTitle, applicationUid);
          this.logger.log(`Sent REJECTED status email (hardcoded) to ${email} for application ${applicationUid}`);
          break;
        default:
          this.logger.debug(`No email sent for status change to ${newStatus} for application ${applicationUid}`);
          break;
      }
    } catch (error) {
      // Log error but don't throw - email sending shouldn't fail the main update
      this.logger.error(`Failed to send status change email for application ${applicationUid}: ${error.message}`, error.stack);
    }
  }

  async remove(uid: string, user: User): Promise<MessageResponseDto> {
    try {
      const application = await this.databaseService.application.findUnique({
        where: { uid },
        include: { jobPosition: true },
      });

      if (!application) {
        throw new EntityNotFoundException('Application', uid);
      }

      // Verify company access before soft delete (through job position)
      verifyCompanyAccess(user, application.jobPosition.companyId);

      // Soft delete: Set deletedAt instead of hard delete
      await this.databaseService.application.update({
        where: { uid },
        data: { deletedAt: new Date() },
      });

      // Log audit trail
      await this.auditLogService.logAction({
        action: 'SOFT_DELETE',
        entityType: 'Application',
        entityId: application.id,
        entityUid: application.uid,
        user,
        metadata: {
          applicantName: application.applicantName,
          applicantEmail: application.applicantEmail,
          jobPositionId: application.jobPositionId,
        },
      });

      return { message: 'Application soft deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to remove: ${error.message}`);
    }
  }

  async acceptApplication(applicationUid: string, user: User): Promise<ApplicationResponseDto> {
    try {
      // Fetch the application with related data
      const application = await this.databaseService.application.findFirst({
        where: { uid: applicationUid, deletedAt: null },
        include: {
          jobPosition: { include: { stages: { orderBy: { position: 'asc' } }, company: true } },
        },
      });

      if (!application) {
        throw new EntityNotFoundException('Application', applicationUid);
      }

      // Verify company access before accepting (through job position)
      verifyCompanyAccess(user, application.jobPosition.companyId);

      if (application.status === ApplicationStatus.ACCEPTED) {
        throw new BadRequestException('Application is already accepted');
      }

      // Check if candidate exists by email
      let candidate = await this.databaseService.candidate.findFirst({
        where: { email: application.applicantEmail },
      });

      // Create candidate if doesn't exist
      if (!candidate) {
        candidate = await this.databaseService.candidate.create({
          data: {
            name: application.applicantName,
            email: application.applicantEmail,
          },
        });
      }

      // Get company from job position (already fetched above)
      const company = application.jobPosition.company;

      if (!company) {
        throw new NotFoundException(`Company not found for job position`);
      }

      // Create hiring process for the candidate
      const hiringProcess = await this.databaseService.hiringProcess.create({
        data: {
          title: application.jobPosition.title + ' - ' + candidate.name,
          candidateId: candidate.id,
          jobPositionId: application.jobPosition.id,
          companyId: company.id,
        },
      });

      // Copy stages from job position to hiring process
      if (application.jobPosition.stages.length > 0) {
        const stages = application.jobPosition.stages.map((stage) => ({
          title: stage.title,
          type: stage.type,
          description: stage.description,
          estimatedTime: stage.estimatedTime,
          position: stage.position,
          hiringProcessId: hiringProcess.id,
          status: stage.position === 0 ? StageStatus.CURRENT : StageStatus.OPEN,
        }));

        await this.databaseService.stage.createMany({
          data: stages,
        });
      }

      // Update application status to ACCEPTED
      const updatedApplication = await this.databaseService.application.update({
        where: { uid: applicationUid },
        data: {
          status: ApplicationStatus.ACCEPTED,
          reviewedAt: new Date(),
        },
        include: includeApplication,
      });

      // Send acceptance email to applicant
      try {
        await this.emailService.sendApplicationAcceptance(application.applicantEmail, application.applicantName, application.jobPosition.title);
      } catch (error) {
        // Log error but don't fail the accept operation
        this.logger.error(`Failed to send acceptance email for application ${applicationUid}:`, error);
      }

      return ApplicationMapper(updatedApplication);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to accept application: ${error.message}`);
    }
  }
}
