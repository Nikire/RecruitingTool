import { forwardRef, Inject, NotFoundException, ForbiddenException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CreateJobPositionDto, JobPositionResponseDto, UpdateJobPositionDto, PublicJobPositionResponseDto, JobPositionFiltersDto, PaginatedPublicJobPositionResponseDto } from './dto/job-position.dto';
import { includeJobPosition, JobPositionMapper, JobPositionOneMapper } from './entities/job-position.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { CandidateService } from '../hiring-process/modules/candidate/candidate.service';
import { HiringProcessService } from '../hiring-process/hiring-process.service';
import { StagesService } from '../hiring-process/modules/stages/stages.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CacheService } from '../cache/cache.service';
import { Prisma, User } from '@prisma/client';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { getUserCompanyId, verifyCompanyAccess } from 'src/utils/company-access.helper';
import { EntityNotFoundException } from 'src/common/exceptions';

export class JobPositionService {
  constructor(
    @Inject(DatabaseService) private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => HiringProcessService)) private readonly hiringProcessService: HiringProcessService,
    private readonly candidateService: CandidateService,
    private readonly stagesService: StagesService,
    private readonly auditLogService: AuditLogService,
    private readonly cacheService: CacheService,
  ) {}

  async find(where: Prisma.JobPositionWhereInput): Promise<Array<JobPositionResponseDto>> {
    try {
      const jobPositions = await this.databaseService.jobPosition.findMany({
        include: includeJobPosition,
        where: { ...where, deletedAt: null }, // Exclude soft-deleted records
      });
      return jobPositions.map((jp) => JobPositionOneMapper(jp));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find: ${error.message}`);
    }
  }

  async list(paginationDto: PaginationDto, user: User): Promise<PaginatedResponse<JobPositionResponseDto>> {
    try {
      const { page = 1, pageSize = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
      const skip = (page - 1) * pageSize;

      // Build where clause for search
      const where: any = search
        ? {
            OR: [{ title: { contains: search, mode: 'insensitive' as const } }],
          }
        : {};

      // Exclude soft-deleted records
      where.deletedAt = null;

      // Add company filter for HR and USER roles
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        where.companyId = userCompanyId;
      }

      // Get total count
      const total = await this.databaseService.jobPosition.count({ where });

      // Get paginated data
      const jobPositions = await this.databaseService.jobPosition.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          ...includeJobPosition,
          stages: {
            where: {
              hiringProcessId: null,
            },
          },
        },
      });

      const totalPages = Math.ceil(total / pageSize);

      return {
        data: jobPositions.map((jp) => JobPositionOneMapper(jp)),
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to list: ${error.message}`);
    }
  }

  async findAll(user: User): Promise<Array<JobPositionResponseDto>> {
    try {
      const where: any = { deletedAt: null }; // Exclude soft-deleted records

      // Add company filter for HR and USER roles
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        where.companyId = userCompanyId;
      }

      const jobPositions = await this.databaseService.jobPosition.findMany({
        where,
        include: {
          ...includeJobPosition,
          stages: {
            where: {
              hiringProcessId: null,
            },
          },
        },
      });
      return jobPositions.map((jp) => JobPositionOneMapper(jp));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find all: ${error.message}`);
    }
  }

  async findOne(uid: string, user?: User): Promise<JobPositionResponseDto> {
    try {
      const jobPosition = await this.databaseService.jobPosition.findFirst({
        where: { uid, deletedAt: null }, // Exclude soft-deleted records
        include: includeJobPosition,
      });

      if (!jobPosition) {
        throw new EntityNotFoundException('Job position', uid);
      }

      // Verify company access if user is provided
      if (user) {
        verifyCompanyAccess(user, jobPosition.companyId);
      }

      return JobPositionOneMapper(jobPosition);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find one: ${error.message}`);
    }
  }

  async create(creatorUid: string, createJobPositionDto: CreateJobPositionDto): Promise<JobPositionResponseDto> {
    try {
      // Get user to find their company
      const user = await this.databaseService.user.findUnique({
        where: { uid: creatorUid },
      });

      if (!user) {
        throw new EntityNotFoundException('User', creatorUid);
      }

      if (!user.companyId) {
        throw new NotFoundException(`User ${creatorUid} does not belong to a company`);
      }

      const newJobPosition = await this.databaseService.jobPosition.create({
        data: {
          title: createJobPositionDto.title,
          description: createJobPositionDto.description,
          customQuestions: (createJobPositionDto.customQuestions ? createJobPositionDto.customQuestions : []) as unknown as Prisma.JsonValue,
          createdBy: { connect: { uid: creatorUid } },
          company: { connect: { id: user.companyId } },
        },
        include: includeJobPosition,
      });

      if (createJobPositionDto.stages) {
        const stages = createJobPositionDto.stages.map((stage) => ({ ...stage, jobPositionUid: newJobPosition.uid }));
        await this.stagesService.bulkCreateStages(stages);
      }

      // Invalidate job positions cache after creation
      await this.cacheService.invalidatePattern('job-position');

      return JobPositionMapper(newJobPosition);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to create: ${error.message}`);
    }
  }

  async update(uid: string, updateJobPositionDto: UpdateJobPositionDto, user: User): Promise<JobPositionResponseDto> {
    try {
      if (!uid) {
        throw new EntityNotFoundException('Job position', uid);
      }

      // Verify company access before update
      const existingJobPosition = await this.databaseService.jobPosition.findUnique({
        where: { uid },
      });

      if (!existingJobPosition) {
        throw new EntityNotFoundException('Job position', uid);
      }

      verifyCompanyAccess(user, existingJobPosition.companyId);

      // Build update data, ensuring customQuestions is properly handled
      const updateData: any = {};
      if (updateJobPositionDto.title !== undefined) updateData.title = updateJobPositionDto.title;
      if (updateJobPositionDto.description !== undefined) updateData.description = updateJobPositionDto.description;
      if (updateJobPositionDto.customQuestions !== undefined) updateData.customQuestions = updateJobPositionDto.customQuestions as unknown as Prisma.JsonValue;

      const jobPosition = await this.databaseService.jobPosition.update({
        where: { uid },
        data: updateData,
        include: includeJobPosition,
      });

      // Invalidate cache for this specific job position and all job positions
      await this.cacheService.invalidate(`job-position:${uid}`);
      await this.cacheService.invalidatePattern('job-position');

      return JobPositionMapper(jobPosition);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to update: ${error.message}`);
    }
  }

  async remove(uid: string, user: User): Promise<MessageResponseDto> {
    try {
      // Verify company access before soft delete
      const existingJobPosition = await this.databaseService.jobPosition.findUnique({
        where: { uid },
      });

      if (!existingJobPosition) {
        throw new EntityNotFoundException('Job position', uid);
      }

      verifyCompanyAccess(user, existingJobPosition.companyId);

      // Soft delete: Set deletedAt instead of hard delete
      await this.databaseService.jobPosition.update({
        where: { uid },
        data: { deletedAt: new Date() },
      });

      // Soft delete all associated template stages (jobPositionId matches, hiringProcessId is null)
      await this.databaseService.stage.updateMany({
        where: {
          jobPositionId: existingJobPosition.id,
          hiringProcessId: null, // Only template stages
        },
        data: { deletedAt: new Date() },
      });

      // Log audit trail
      await this.auditLogService.logAction({
        action: 'SOFT_DELETE',
        entityType: 'JobPosition',
        entityId: existingJobPosition.id,
        entityUid: existingJobPosition.uid,
        user,
        metadata: {
          title: existingJobPosition.title,
          companyId: existingJobPosition.companyId,
        },
      });

      // Invalidate cache after deletion
      await this.cacheService.invalidatePattern('job-position');

      return { message: `Job position soft deleted successfully` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to remove: ${error.message}`);
    }
  }

  async findAllPublic(filters?: JobPositionFiltersDto): Promise<PaginatedPublicJobPositionResponseDto> {
    try {
      // Extract pagination params with defaults
      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.JobPositionWhereInput = {
        status: 'OPEN',
        deletedAt: null, // Exclude soft-deleted records
      };

      // Search filter (title, description)
      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Category filter
      if (filters?.category) {
        where.jobCategory = { contains: filters.category, mode: 'insensitive' };
      }

      // Job type filter
      if (filters?.jobType) {
        where.jobType = filters.jobType;
      }

      // Work location filter
      if (filters?.workLocation) {
        where.workLocation = filters.workLocation;
      }

      // Experience level filter
      if (filters?.experienceLevel) {
        where.experienceLevel = filters.experienceLevel;
      }

      // Salary range filters
      if (filters?.salaryMin !== undefined || filters?.salaryMax !== undefined) {
        where.AND = [];

        if (filters?.salaryMin !== undefined) {
          where.AND.push({
            OR: [
              { salaryMax: { gte: filters.salaryMin } }, // Max salary meets minimum
              { salaryMin: { gte: filters.salaryMin } }, // Min salary meets minimum
            ],
          });
        }

        if (filters?.salaryMax !== undefined) {
          where.AND.push({
            OR: [
              { salaryMin: { lte: filters.salaryMax } }, // Min salary within maximum
              { salaryMax: { lte: filters.salaryMax } }, // Max salary within maximum
            ],
          });
        }
      }

      // Company filter (by UID)
      if (filters?.companyUid) {
        const company = await this.databaseService.company.findUnique({
          where: { uid: filters.companyUid },
          select: { id: true },
        });
        if (company) {
          where.companyId = company.id;
        }
      }

      // Build orderBy clause
      let orderBy: Prisma.JobPositionOrderByWithRelationInput = { createdAt: 'desc' };

      if (filters?.sortBy) {
        const sortOrder = filters.sortOrder || 'desc';

        switch (filters.sortBy) {
          case 'title':
            orderBy = { title: sortOrder };
            break;
          case 'salary':
            // Sort by average of min and max salary
            orderBy = { salaryMin: sortOrder };
            break;
          case 'createdAt':
          default:
            orderBy = { createdAt: sortOrder };
            break;
        }
      }

      // Get total count for pagination
      const total = await this.databaseService.jobPosition.count({ where });

      // Get paginated data
      const jobPositions = await this.databaseService.jobPosition.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          company: true,
          stages: {
            orderBy: {
              position: 'asc',
            },
          },
        },
      });

      const data = jobPositions.map((jp) => ({
        uid: jp.uid,
        title: jp.title,
        description: jp.description,
        status: jp.status,
        jobCategory: jp.jobCategory,
        jobType: jp.jobType,
        workLocation: jp.workLocation,
        salaryMin: jp.salaryMin,
        salaryMax: jp.salaryMax,
        salaryCurrency: jp.salaryCurrency,
        salaryPeriod: jp.salaryPeriod,
        benefits: jp.benefits,
        requirements: jp.requirements,
        responsibilities: jp.responsibilities,
        experienceLevel: jp.experienceLevel,
        educationLevel: jp.educationLevel,
        skills: jp.skills,
        applicationDeadline: jp.applicationDeadline,
        isUrgent: jp.isUrgent,
        isFeatured: jp.isFeatured,
        companyName: jp.company?.name || 'Unknown Company',
        companyDescription: jp.company?.description,
        createdAt: jp.createdAt,
        customQuestions: jp.customQuestions as any,
        stages: jp.stages,
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find all public: ${error.message}`);
    }
  }

  async findOnePublic(uid: string): Promise<PublicJobPositionResponseDto> {
    try {
      const jobPosition = await this.databaseService.jobPosition.findFirst({
        where: {
          uid,
          status: 'OPEN',
          deletedAt: null, // Exclude soft-deleted records
        },
        include: {
          company: true,
          stages: {
            where: {
              hiringProcessId: null,
            },
            orderBy: {
              position: 'asc',
            },
            include: {
              hiringProcess: true,
            },
          },
        },
      });

      if (!jobPosition) {
        throw new NotFoundException(`Job position with UID ${uid} not found or is not open`);
      }

      return {
        uid: jobPosition.uid,
        title: jobPosition.title,
        description: jobPosition.description,
        status: jobPosition.status,
        jobCategory: jobPosition.jobCategory,
        jobType: jobPosition.jobType,
        workLocation: jobPosition.workLocation,
        salaryMin: jobPosition.salaryMin,
        salaryMax: jobPosition.salaryMax,
        salaryCurrency: jobPosition.salaryCurrency,
        salaryPeriod: jobPosition.salaryPeriod,
        benefits: jobPosition.benefits,
        requirements: jobPosition.requirements,
        responsibilities: jobPosition.responsibilities,
        experienceLevel: jobPosition.experienceLevel,
        educationLevel: jobPosition.educationLevel,
        skills: jobPosition.skills,
        applicationDeadline: jobPosition.applicationDeadline,
        isUrgent: jobPosition.isUrgent,
        isFeatured: jobPosition.isFeatured,
        companyName: jobPosition.company?.name || 'Unknown Company',
        companyDescription: jobPosition.company?.description,
        createdAt: jobPosition.createdAt,
        customQuestions: jobPosition.customQuestions as any,
        stages: jobPosition.stages.map((stage) => ({
          uid: stage.uid,
          title: stage.title,
          type: stage.type,
          description: stage.description,
          estimatedTime: stage.estimatedTime,
          position: stage.position,
          status: stage.status,
          jobPositionUid: stage.jobPositionId ? jobPosition.uid : undefined,
          hiringProcessUid: stage.hiringProcess?.uid,
        })),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find one public: ${error.message}`);
    }
  }
}
