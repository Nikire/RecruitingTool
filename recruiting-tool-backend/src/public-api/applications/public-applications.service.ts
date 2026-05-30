import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from '../../modules/shared/modules/database/database.service';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { CreatePublicApplicationDto } from './dto/create-public-application.dto';
import { UpdatePublicApplicationStatusDto } from './dto/update-public-application-status.dto';
import { PublicApplicationResponseDto } from './dto/public-application-response.dto';
import { PublicApplicationsListResponseDto } from './dto/public-applications-list-response.dto';

@Injectable()
export class PublicApplicationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    companyId: number,
    query: {
      page?: number;
      limit?: number;
      jobPositionUid?: string;
      status?: string;
    },
  ): Promise<PublicApplicationsListResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {
      deletedAt: null,
      jobPosition: {
        companyId,
        deletedAt: null,
      },
    };

    if (query.jobPositionUid) {
      where.jobPosition = {
        ...((where.jobPosition as Prisma.JobPositionWhereInput) ?? {}),
        uid: query.jobPositionUid,
        companyId,
        deletedAt: null,
      };
    }

    if (query.status) {
      where.status = query.status as ApplicationStatus;
    }

    const [applications, total] = await Promise.all([
      this.db.application.findMany({
        where,
        include: { jobPosition: true },
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
      }),
      this.db.application.count({ where }),
    ]);

    return {
      data: applications.map((a) => this.toResponseDto(a)),
      total,
      page,
      limit,
      hasMore: skip + applications.length < total,
    };
  }

  async findOne(uid: string, companyId: number): Promise<PublicApplicationResponseDto> {
    const application = await this.db.application.findFirst({
      where: {
        uid,
        deletedAt: null,
        jobPosition: { companyId, deletedAt: null },
      },
      include: { jobPosition: true },
    });

    if (!application) {
      throw new NotFoundException(`Application with uid "${uid}" not found`);
    }

    return this.toResponseDto(application);
  }

  async create(companyId: number, dto: CreatePublicApplicationDto): Promise<PublicApplicationResponseDto> {
    // Find the job position scoped to the company
    const jobPosition = await this.db.jobPosition.findFirst({
      where: { uid: dto.jobPositionUid, companyId, deletedAt: null },
    });

    if (!jobPosition) {
      throw new NotFoundException(`Job position with uid "${dto.jobPositionUid}" not found`);
    }

    // Check for duplicate application (same email + job position)
    const existing = await this.db.application.findFirst({
      where: {
        jobPositionId: jobPosition.id,
        applicantEmail: dto.applicantEmail,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(`An application from "${dto.applicantEmail}" already exists for this job position`);
    }

    const application = await this.db.application.create({
      data: {
        jobPositionId: jobPosition.id,
        applicantName: dto.applicantName,
        applicantEmail: dto.applicantEmail,
        applicantPhone: dto.applicantPhone,
        coverLetter: dto.coverLetter ?? null,
        status: ApplicationStatus.PENDING,
      },
      include: { jobPosition: true },
    });

    return this.toResponseDto(application);
  }

  async updateStatus(uid: string, companyId: number, dto: UpdatePublicApplicationStatusDto): Promise<PublicApplicationResponseDto> {
    const application = await this.db.application.findFirst({
      where: {
        uid,
        deletedAt: null,
        jobPosition: { companyId, deletedAt: null },
      },
      include: { jobPosition: true },
    });

    if (!application) {
      throw new NotFoundException(`Application with uid "${uid}" not found`);
    }

    const updated = await this.db.application.update({
      where: { id: application.id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: { jobPosition: true },
    });

    this.eventEmitter.emit('webhook.deliver', {
      event: 'application.status_changed',
      companyId,
      payload: { uid: updated.uid, status: updated.status },
    });

    return this.toResponseDto(updated);
  }

  private toResponseDto(application: {
    uid: string;
    status: ApplicationStatus;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    coverLetter: string | null;
    appliedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    jobPosition: { uid: string } | null;
  }): PublicApplicationResponseDto {
    return {
      uid: application.uid,
      status: application.status,
      applicantName: application.applicantName,
      applicantEmail: application.applicantEmail,
      applicantPhone: application.applicantPhone,
      coverLetter: application.coverLetter,
      jobPositionUid: application.jobPosition?.uid ?? '',
      appliedAt: application.appliedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}
