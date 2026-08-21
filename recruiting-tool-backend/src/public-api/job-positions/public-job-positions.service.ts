import { Injectable, NotFoundException } from '@nestjs/common';
import { JobModerationStatus, JobPositionStatus } from '@prisma/client';
import { DatabaseService } from '../../modules/shared/modules/database/database.service';
import { CreatePublicJobPositionDto } from './dto/create-public-job-position.dto';
import { UpdatePublicJobPositionDto } from './dto/update-public-job-position.dto';
import { PublicApiJobPositionResponseDto } from './dto/public-job-position-response.dto';
import { PublicJobPositionsListResponseDto } from './dto/public-job-positions-list-response.dto';
import { hasActivePaidSubscription } from '../../utils/subscription-status.helper';

@Injectable()
export class PublicJobPositionsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(companyId: number, query: { page?: number; limit?: number; status?: string }): Promise<PublicJobPositionsListResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: {
      companyId: number;
      deletedAt: null;
      status?: JobPositionStatus;
    } = {
      companyId,
      deletedAt: null,
    };

    if (query.status) {
      const statusUpper = query.status.toUpperCase();
      if (Object.values(JobPositionStatus).includes(statusUpper as JobPositionStatus)) {
        where.status = statusUpper as JobPositionStatus;
      }
    }

    const [items, total] = await Promise.all([
      this.db.jobPosition.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.jobPosition.count({ where }),
    ]);

    return {
      data: items.map((item) => this.toResponseDto(item)),
      total,
      page,
      limit,
      hasMore: skip + items.length < total,
    };
  }

  async findOne(uid: string, companyId: number): Promise<PublicApiJobPositionResponseDto> {
    const item = await this.db.jobPosition.findFirst({
      where: { uid, companyId, deletedAt: null },
    });

    if (!item) {
      throw new NotFoundException(`Job position with uid "${uid}" not found`);
    }

    return this.toResponseDto(item);
  }

  async create(companyId: number, dto: CreatePublicJobPositionDto): Promise<PublicApiJobPositionResponseDto> {
    // We need a createdById — use a placeholder system user for API-key created records.
    // Fetch the first admin/owner user for this company to satisfy the FK constraint.
    const companyUser = await this.db.user.findFirst({
      where: { companyId },
      select: { id: true },
    });

    if (!companyUser) {
      throw new NotFoundException('No user found for this company to associate with the job position');
    }

    // Anti-spam moderation gate: postings created through the API key follow the same
    // rule as the UI — only companies with an active paid subscription publish instantly.
    const subscription = await this.db.subscription.findUnique({
      where: { companyId },
      select: { status: true, plan: true, currentPeriodEnd: true, gracePeriodEndsAt: true },
    });
    const autoApproved = hasActivePaidSubscription(subscription);

    const item = await this.db.jobPosition.create({
      data: {
        moderationStatus: autoApproved ? JobModerationStatus.APPROVED : JobModerationStatus.PENDING_APPROVAL,
        moderatedAt: autoApproved ? new Date() : null,
        title: dto.title,
        description: dto.description,
        status: dto.status ?? JobPositionStatus.OPEN,
        jobCategory: dto.jobCategory,
        jobType: dto.jobType,
        workLocation: dto.workLocation,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        salaryCurrency: dto.salaryCurrency ?? 'USD',
        salaryPeriod: dto.salaryPeriod,
        showSalary: dto.showSalary ?? false,
        experienceLevel: dto.experienceLevel,
        educationLevel: dto.educationLevel,
        skills: dto.skills ?? [],
        requirements: dto.requirements ?? [],
        responsibilities: dto.responsibilities ?? [],
        benefits: dto.benefits ?? [],
        tags: dto.tags ?? [],
        city: dto.city,
        state: dto.state,
        country: dto.country,
        isFeatured: dto.isFeatured ?? false,
        isUrgent: dto.isUrgent ?? false,
        isHighlighted: dto.isHighlighted ?? false,
        applicationDeadline: dto.applicationDeadline,
        candidateSource: dto.candidateSource,
        companyId,
        createdById: companyUser.id,
      },
    });

    return this.toResponseDto(item);
  }

  async update(uid: string, companyId: number, dto: UpdatePublicJobPositionDto): Promise<PublicApiJobPositionResponseDto> {
    const existing = await this.db.jobPosition.findFirst({
      where: { uid, companyId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Job position with uid "${uid}" not found`);
    }

    const item = await this.db.jobPosition.update({
      where: { id: existing.id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.jobCategory !== undefined && { jobCategory: dto.jobCategory }),
        ...(dto.jobType !== undefined && { jobType: dto.jobType }),
        ...(dto.workLocation !== undefined && { workLocation: dto.workLocation }),
        ...(dto.salaryMin !== undefined && { salaryMin: dto.salaryMin }),
        ...(dto.salaryMax !== undefined && { salaryMax: dto.salaryMax }),
        ...(dto.salaryCurrency !== undefined && { salaryCurrency: dto.salaryCurrency }),
        ...(dto.salaryPeriod !== undefined && { salaryPeriod: dto.salaryPeriod }),
        ...(dto.showSalary !== undefined && { showSalary: dto.showSalary }),
        ...(dto.experienceLevel !== undefined && { experienceLevel: dto.experienceLevel }),
        ...(dto.educationLevel !== undefined && { educationLevel: dto.educationLevel }),
        ...(dto.skills !== undefined && { skills: dto.skills }),
        ...(dto.requirements !== undefined && { requirements: dto.requirements }),
        ...(dto.responsibilities !== undefined && { responsibilities: dto.responsibilities }),
        ...(dto.benefits !== undefined && { benefits: dto.benefits }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
        ...(dto.isUrgent !== undefined && { isUrgent: dto.isUrgent }),
        ...(dto.isHighlighted !== undefined && { isHighlighted: dto.isHighlighted }),
        ...(dto.applicationDeadline !== undefined && { applicationDeadline: dto.applicationDeadline }),
        ...(dto.candidateSource !== undefined && { candidateSource: dto.candidateSource }),
      },
    });

    return this.toResponseDto(item);
  }

  private toResponseDto(item: {
    uid: string;
    title: string;
    description: string | null;
    status: JobPositionStatus;
    jobCategory: string | null;
    jobType: import('@prisma/client').JobType | null;
    workLocation: import('@prisma/client').WorkLocation | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string;
    salaryPeriod: import('@prisma/client').SalaryPeriod | null;
    showSalary: boolean;
    experienceLevel: import('@prisma/client').ExperienceLevel | null;
    educationLevel: string | null;
    skills: string[];
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    tags: string[];
    city: string | null;
    state: string | null;
    country: string | null;
    isFeatured: boolean;
    isUrgent: boolean;
    isHighlighted: boolean;
    applicationDeadline: Date | null;
    applicationCount: number;
    viewCount: number;
    candidateSource: string | null;
    moderationStatus: JobModerationStatus;
    moderationReason: string | null;
    moderatedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): PublicApiJobPositionResponseDto {
    return {
      uid: item.uid,
      title: item.title,
      description: item.description,
      status: item.status,
      jobCategory: item.jobCategory,
      jobType: item.jobType,
      workLocation: item.workLocation,
      salaryMin: item.salaryMin,
      salaryMax: item.salaryMax,
      salaryCurrency: item.salaryCurrency,
      salaryPeriod: item.salaryPeriod,
      showSalary: item.showSalary,
      experienceLevel: item.experienceLevel,
      educationLevel: item.educationLevel,
      skills: item.skills,
      requirements: item.requirements,
      responsibilities: item.responsibilities,
      benefits: item.benefits,
      tags: item.tags,
      city: item.city,
      state: item.state,
      country: item.country,
      isFeatured: item.isFeatured,
      isUrgent: item.isUrgent,
      isHighlighted: item.isHighlighted,
      applicationDeadline: item.applicationDeadline,
      applicationCount: item.applicationCount,
      viewCount: item.viewCount,
      candidateSource: item.candidateSource,
      moderationStatus: item.moderationStatus,
      moderationReason: item.moderationReason,
      moderatedAt: item.moderatedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
