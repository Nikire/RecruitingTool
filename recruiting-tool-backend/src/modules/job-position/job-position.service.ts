import { forwardRef, Inject, NotFoundException, ForbiddenException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CreateJobPositionDto, JobPositionResponseDto, UpdateJobPositionDto, PublicJobPositionResponseDto } from './dto/job-position.dto';
import { includeJobPosition, JobPositionMapper, JobPositionOneMapper } from './entities/job-position.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { CandidateService } from '../hiring-process/modules/candidate/candidate.service';
import { HiringProcessService } from '../hiring-process/hiring-process.service';
import { StagesService } from '../hiring-process/modules/stages/stages.service';
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
  ) {}

  async find(where: Prisma.JobPositionWhereInput): Promise<Array<JobPositionResponseDto>> {
    try {
    const jobPositions = await this.databaseService.jobPosition.findMany({
      include: includeJobPosition,
      where,
    });
    return jobPositions.map((jp) => JobPositionOneMapper(jp));
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to find: ${error.message}`,
      );
    }}

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
      throw new InternalServerErrorException(
        `Failed to list: ${error.message}`,
      );
    }}

  async findAll(user: User): Promise<Array<JobPositionResponseDto>> {
    try {
    const where: any = {};

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
      throw new InternalServerErrorException(
        `Failed to find all: ${error.message}`,
      );
    }}

  async findOne(uid: string, user?: User): Promise<JobPositionResponseDto> {
    try {
    const jobPosition = await this.databaseService.jobPosition.findUnique({
      where: { uid },
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
      throw new InternalServerErrorException(
        `Failed to find one: ${error.message}`,
      );
    }}

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

    let newJobPosition = await this.databaseService.jobPosition.create({
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

    return JobPositionMapper(newJobPosition);
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create: ${error.message}`,
      );
    }}

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

    return JobPositionMapper(jobPosition);
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update: ${error.message}`,
      );
    }}

  async remove(uid: string, user: User): Promise<MessageResponseDto> {
    try {
    // Verify company access before delete
    const existingJobPosition = await this.databaseService.jobPosition.findUnique({
      where: { uid },
    });

    if (!existingJobPosition) {
      throw new EntityNotFoundException('Job position', uid);
    }

    verifyCompanyAccess(user, existingJobPosition.companyId);

    const jobPosition = await this.databaseService.jobPosition.delete({
      where: { uid },
    });

    return { message: `Job position deleted successfully` };
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to remove: ${error.message}`,
      );
    }}

  async findAllPublic(): Promise<Array<PublicJobPositionResponseDto>> {
    try {
    const jobPositions = await this.databaseService.jobPosition.findMany({
      where: {
        status: "OPEN",
      },
      include: {
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return jobPositions.map((jp) => ({
      uid: jp.uid,
      title: jp.title,
      description: jp.description,
      companyName: jp.company?.name || "Unknown Company",
      companyDescription: jp.company?.description,
      createdAt: jp.createdAt,
      customQuestions: jp.customQuestions as any,
    }));
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to find all public: ${error.message}`,
      );
    }}

  async findOnePublic(uid: string): Promise<PublicJobPositionResponseDto> {
    try {
      const jobPosition = await this.databaseService.jobPosition.findFirst({
        where: {
          uid,
          status: "OPEN",
        },
        include: {
          company: true,
          stages: {
            orderBy: {
              position: 'asc',
            },
          },
        },
      });

      if (\!jobPosition) {
        throw new NotFoundException(\);
      }

      return {
        uid: jobPosition.uid,
        title: jobPosition.title,
        description: jobPosition.description,
        companyName: jobPosition.company?.name || "Unknown Company",
        companyDescription: jobPosition.company?.description,
        createdAt: jobPosition.createdAt,
        customQuestions: jobPosition.customQuestions as any,
        stages: jobPosition.stages.map(stage => ({
          uid: stage.uid,
          title: stage.title,
          type: stage.type,
          description: stage.description,
          estimatedTime: stage.estimatedTime,
          position: stage.position,
        })),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        \,
      );
    }}

}
