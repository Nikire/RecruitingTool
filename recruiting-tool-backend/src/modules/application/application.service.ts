import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { ApplicationMapper, includeApplication } from './entities/application.entity';
import { ApplicationResponseDto, CreateApplicationDto, UpdateApplicationDto, ApplicationFilterDto } from './dto/application.dto';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { ApplicationStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';

@Injectable()
export class ApplicationService {
  constructor(private databaseService: DatabaseService, private emailService: EmailService) {}

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

  async findAll(filterDto: ApplicationFilterDto): Promise<ApplicationResponseDto[]> {
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

    const applications = await this.databaseService.application.findMany({
      where,
      include: includeApplication,
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return applications.map(ApplicationMapper);
  }

  async findOne(uid: string): Promise<ApplicationResponseDto> {
    const application = await this.databaseService.application.findUnique({
      where: { uid },
      include: includeApplication,
    });

    if (!application) {
      throw new NotFoundException(`Application ${uid} not found`);
    }

    return ApplicationMapper(application);
  }

  async update(uid: string, updateApplicationDto: UpdateApplicationDto, reviewerUid: string): Promise<ApplicationResponseDto> {
    const application = await this.databaseService.application.findUnique({
      where: { uid },
    });

    if (!application) {
      throw new NotFoundException(`Application ${uid} not found`);
    }

    const reviewer = await this.databaseService.user.findUnique({
      where: { uid: reviewerUid },
    });

    if (!reviewer) {
      throw new NotFoundException(`Reviewer ${reviewerUid} not found`);
    }

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

    return ApplicationMapper(updatedApplication);
  }

  async remove(uid: string): Promise<MessageResponseDto> {
    const application = await this.databaseService.application.findUnique({
      where: { uid },
    });

    if (!application) {
      throw new NotFoundException(`Application ${uid} not found`);
    }

    await this.databaseService.application.delete({
      where: { uid },
    });

    return { message: 'Application successfully deleted' };
  }
}
