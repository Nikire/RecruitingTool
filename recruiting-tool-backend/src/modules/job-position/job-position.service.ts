import { forwardRef, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CreateJobPositionDto, JobPositionResponseDto, UpdateJobPositionDto } from './dto/job-position.dto';
import { includeJobPosition, JobPositionMapper, JobPositionOneMapper } from './entities/job-position.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { CandidateService } from '../hiring-process/modules/candidate/candidate.service';
import { HiringProcessService } from '../hiring-process/hiring-process.service';
import { StagesService } from '../hiring-process/modules/stages/stages.service';
import { Prisma } from '@prisma/client';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';

export class JobPositionService {
  constructor(
    @Inject(DatabaseService) private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => HiringProcessService)) private readonly hiringProcessService: HiringProcessService,
    private readonly candidateService: CandidateService,
    private readonly stagesService: StagesService,
  ) {}

  async find(where: Prisma.JobPositionWhereInput): Promise<Array<JobPositionResponseDto>> {
    const jobPositions = await this.databaseService.jobPosition.findMany({
      include: includeJobPosition,
      where,
    });
    return jobPositions.map((jp) => JobPositionOneMapper(jp));
  }

  async list(paginationDto: PaginationDto): Promise<PaginatedResponse<JobPositionResponseDto>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [{ title: { contains: search, mode: 'insensitive' as const } }],
        }
      : {};

    // Get total count
    const total = await this.databaseService.jobPosition.count({ where });

    // Get paginated data
    const jobPositions = await this.databaseService.jobPosition.findMany({
      where,
      skip,
      take: limit,
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

    const totalPages = Math.ceil(total / limit);

    return {
      data: jobPositions.map((jp) => JobPositionOneMapper(jp)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findAll(): Promise<Array<JobPositionResponseDto>> {
    const jobPositions = await this.databaseService.jobPosition.findMany({
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
  }

  async findOne(uid: string): Promise<JobPositionResponseDto> {
    const jobPosition = await this.databaseService.jobPosition.findUnique({
      where: { uid },
      include: includeJobPosition,
    });

    if (!jobPosition) {
      throw new NotFoundException(`Job position ${uid} not found`);
    }

    return JobPositionOneMapper(jobPosition);
  }

  async create(creatorUid: string, createJobPositionDto: CreateJobPositionDto): Promise<JobPositionResponseDto> {
    // Get user to find their company
    const user = await this.databaseService.user.findUnique({
      where: { uid: creatorUid },
    });

    if (!user) {
      throw new NotFoundException(`User ${creatorUid} not found`);
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
  }

  async update(uid: string, updateJobPositionDto: UpdateJobPositionDto): Promise<JobPositionResponseDto> {
    if (!uid) {
      throw new NotFoundException(`Job position ${uid} not found`);
    }

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

    if (!jobPosition) {
      throw new NotFoundException(`Job position ${uid} not found`);
    }
    return JobPositionMapper(jobPosition);
  }

  async remove(uid: string): Promise<MessageResponseDto> {
    const jobPosition = await this.databaseService.jobPosition.delete({
      where: { uid },
    });
    if (!jobPosition) {
      throw new NotFoundException(`Job position ${uid} not found`);
    }
    return { message: `Job position deleted successfully` };
  }

  async findAllPublic(): Promise<Array<any>> {
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
    }));
  }
}
