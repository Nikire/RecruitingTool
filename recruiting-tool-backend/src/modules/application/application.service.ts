import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { ApplicationMapper, includeApplication } from './entities/application.entity';
import { ApplicationResponseDto, CreateApplicationDto, UpdateApplicationDto, ApplicationFilterDto } from './dto/application.dto';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { ApplicationStatus, StageStatus, User } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { getUserCompanyId, verifyCompanyAccess } from 'src/utils/company-access.helper';

@Injectable()
export class ApplicationService {
  constructor(
    private databaseService: DatabaseService,
    private emailService: EmailService,
  ) {}

  async create(createApplicationDto: CreateApplicationDto): Promise<ApplicationResponseDto> {
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
    await this.emailService.sendApplicationConfirmation(
      application.applicantEmail,
      application.applicantName,
      jobPosition.title,
      application.uid,
    );

    // Send notification to HR (find first HR user)
    const hrUsers = await this.databaseService.user.findMany({
      where: {
        roles: { has: "HR" },
      },
      take: 1,
    });

    if (hrUsers.length > 0) {
      await this.emailService.sendNewApplicationNotification(
        hrUsers[0].email,
        application.applicantName,
        jobPosition.title,
        application.uid,
      );
    }

    return ApplicationMapper(application);
  }

  async findAll(filterDto: ApplicationFilterDto, user: User): Promise<ApplicationResponseDto[]> {
    const where: any = {};

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
  }

  async findOne(uid: string, user?: User): Promise<ApplicationResponseDto> {
    const application = await this.databaseService.application.findUnique({
      where: { uid },
      include: includeApplication,
    });

    if (!application) {
      throw new NotFoundException(`Application ${uid} not found`);
    }

    // Verify company access if user is provided (through job position)
    if (user) {
      verifyCompanyAccess(user, application.jobPosition.companyId);
    }

    return ApplicationMapper(application);
  }

  async update(uid: string, updateApplicationDto: UpdateApplicationDto, reviewerUid: string, user: User): Promise<ApplicationResponseDto> {
    const application = await this.databaseService.application.findUnique({
      where: { uid },
      include: { jobPosition: true },
    });

    if (!application) {
      throw new NotFoundException(`Application ${uid} not found`);
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
          break;
        case ApplicationStatus.ACCEPTED:
          await this.emailService.sendApplicationAcceptance(email, name, jobTitle);
          break;
        case ApplicationStatus.REJECTED:
          await this.emailService.sendApplicationRejection(email, name, jobTitle, applicationUid);
          break;
        default:
          break;
      }
    } catch (error) {
      // Log error but don't throw - email sending shouldn't fail the main update
      console.error(`Failed to send status change email for application ${applicationUid}:`, error);
    }
  }

  async remove(uid: string, user: User): Promise<MessageResponseDto> {
    const application = await this.databaseService.application.findUnique({
      where: { uid },
      include: { jobPosition: true },
    });

    if (!application) {
      throw new NotFoundException(`Application ${uid} not found`);
    }

    // Verify company access before delete (through job position)
    verifyCompanyAccess(user, application.jobPosition.companyId);

    await this.databaseService.application.delete({
      where: { uid },
    });

    return { message: 'Application successfully deleted' };
  }

  async acceptApplication(applicationUid: string, user: User): Promise<ApplicationResponseDto> {
    // Fetch the application with related data
    const application = await this.databaseService.application.findUnique({
      where: { uid: applicationUid },
      include: {
        jobPosition: { include: { stages: { orderBy: { position: 'asc' } }, company: true } },
      },
    });

    if (!application) {
      throw new NotFoundException(`Application ${applicationUid} not found`);
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
      await this.emailService.sendApplicationAcceptance(
        application.applicantEmail,
        application.applicantName,
        application.jobPosition.title,
      );
    } catch (error) {
      // Log error but don't fail the accept operation
      console.error(`Failed to send acceptance email for application ${applicationUid}:`, error);
    }

    return ApplicationMapper(updatedApplication);
  }
}
