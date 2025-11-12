import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHiringProcessDto, HiringProcessFindDto, HiringProcessResponseDto, UpdateHiringProcessDto } from './dto/hiring-process.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { HiringProcessOneMapper, includeHiringProcess } from './entities/hiring-process.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { JobPositionService } from '../job-position/job-position.service';
import { CandidateService } from './modules/candidate/candidate.service';
import { StagesService } from './modules/stages/stages.service';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';

@Injectable()
export class HiringProcessService {
  constructor(
    @Inject(DatabaseService) private databaseService: DatabaseService,
    @Inject(forwardRef(() => JobPositionService)) private readonly jobPositionService: JobPositionService,
    private readonly candidateService: CandidateService,
    private readonly stagesService: StagesService,
  ) {}

  async create(createHiringProcessDto: CreateHiringProcessDto): Promise<HiringProcessResponseDto> {
    const candidate = await this.candidateService.findOne(createHiringProcessDto.candidateUid);

    if (!candidate) {
      throw new NotFoundException(`Candidate ${createHiringProcessDto.candidateUid} not found`);
    }

    const jobPosition = await this.jobPositionService.findOne(createHiringProcessDto.jobPositionUid);

    if (!jobPosition.stages?.length) {
      throw new NotFoundException(`There is no stages on job position ${jobPosition.uid}`);
    }

    // Get companyId from jobPosition
    const companyId = jobPosition.companyId;

    const newHiringProcess = await this.databaseService.hiringProcess.create({
      data: {
        title: jobPosition.title + ' - ' + candidate.name,
        candidate: { connect: { uid: candidate.uid } },
        jobPosition: { connect: { uid: jobPosition.uid } },
        company: { connect: { id: companyId } },
      },
      include: includeHiringProcess,
    });

    // Copy stages from job position template, but link them ONLY to the hiring process
    // Do NOT include jobPositionUid so stages are isolated to this hiring process
    const copiedStages = jobPosition.stages.map(({ uid, jobPositionUid, status, position, ...rest }) => ({
      ...rest,
      hiringProcessUid: newHiringProcess.uid,
      // Note: jobPositionUid is intentionally omitted - stages belong to hiring process only
    }));
    await this.stagesService.bulkCreateStages(copiedStages);

    return HiringProcessOneMapper(newHiringProcess);
  }

  async list(paginationDto: PaginationDto): Promise<PaginatedResponse<HiringProcessResponseDto>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [{ title: { contains: search, mode: 'insensitive' as const } }],
        }
      : {};

    // Get total count
    const total = await this.databaseService.hiringProcess.count({ where });

    // Get paginated data
    const hiringProcesses = await this.databaseService.hiringProcess.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: includeHiringProcess,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: hiringProcesses.map((hp) => HiringProcessOneMapper(hp)),
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

  async findAll(hiringProcessFindDto: HiringProcessFindDto): Promise<Array<HiringProcessResponseDto>> {
    const hiringProcesses = await this.databaseService.hiringProcess.findMany({
      include: includeHiringProcess,
      where: hiringProcessFindDto.candidateUid ? { candidate: { uid: hiringProcessFindDto.candidateUid } } : {},
    });
    return hiringProcesses.map((hp) => HiringProcessOneMapper(hp));
  }

  async findOne(uid: string): Promise<HiringProcessResponseDto> {
    const hiringProcess = await this.databaseService.hiringProcess.findUnique({
      where: { uid },
      include: includeHiringProcess,
    });

    if (!hiringProcess) {
      throw new NotFoundException(`Hiring process ${uid} not found`);
    }

    return HiringProcessOneMapper(hiringProcess);
  }

  async update(uid: string, updateHiringProcessDto: UpdateHiringProcessDto): Promise<HiringProcessResponseDto> {
    if (!uid) {
      throw new NotFoundException(`Hiring process ${uid} not found`);
    }

    const hiringProcess = await this.databaseService.hiringProcess.update({
      where: { uid },
      data: { ...updateHiringProcessDto },
      include: includeHiringProcess,
    });

    if (!hiringProcess) {
      throw new NotFoundException(`Hiring process ${uid} not found`);
    }
    return HiringProcessOneMapper(hiringProcess);
  }

  async remove(uid: string): Promise<MessageResponseDto> {
    const hiringProcess = await this.databaseService.hiringProcess.delete({
      where: { uid },
    });
    if (!hiringProcess) {
      throw new NotFoundException(`Hiring process ${uid} not found`);
    }
    return { message: `Hiring Process deleted successfully` };
  }
}
