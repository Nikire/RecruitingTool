import { Injectable, NotFoundException, BadRequestException, HttpException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../shared/modules/database/database.service';
import { ApplicationMapper, includeApplication } from './entities/application.entity';
import { ApplicationResponseDto, CreateApplicationDto, UpdateApplicationDto, ApplicationFilterDto } from './dto/application.dto';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { ApplicationStatus, StageStatus, User } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { getUserCompanyId, verifyCompanyAccess } from 'src/utils/company-access.helper';
import { EntityNotFoundException } from 'src/common/exceptions';
import { SseService } from '../sse/sse.service';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    private databaseService: DatabaseService,
    private emailService: EmailService,
    private sseService: SseService,
    private configService: ConfigService,
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

      return ApplicationMapper(application);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
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
        );
      }

      return ApplicationMapper(updatedApplication);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to update: ${error.message}`);
    }
  }

  private async sendStatusChangeEmail(
    email: string,
    name: string,
    jobTitle: string,
    applicationUid: string,
    oldStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
  ): Promise<void> {
    try {
      switch (newStatus) {
        case ApplicationStatus.REVIEWED:
          await this.emailService.sendApplicationUnderReview(email, name, jobTitle, applicationUid);
          this.logger.log(`Sent REVIEWED status email to ${email} for application ${applicationUid}`);
          break;
        case ApplicationStatus.ACCEPTED:
          await this.emailService.sendApplicationAcceptance(email, name, jobTitle);
          this.logger.log(`Sent ACCEPTED status email to ${email} for application ${applicationUid}`);
          break;
        case ApplicationStatus.REJECTED:
          await this.emailService.sendApplicationRejection(email, name, jobTitle, applicationUid);
          this.logger.log(`Sent REJECTED status email to ${email} for application ${applicationUid}`);
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
