import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHiringProcessDto, HiringProcessFindDto, HiringProcessResponseDto, UpdateHiringProcessDto } from './dto/hiring-process.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { HiringProcessOneMapper, includeHiringProcess } from './entities/hiring-process.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { JobPositionService } from '../job-position/job-position.service';
import { CandidateService } from './modules/candidate/candidate.service';
import { StagesService } from './modules/stages/stages.service';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { User } from '@prisma/client';
import { getUserCompanyId, verifyCompanyAccess } from 'src/utils/company-access.helper';

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

    // Get companyId from jobPosition - need to fetch the company ID from UID
    const company = await this.databaseService.company.findUnique({
      where: { uid: jobPosition.companyUid },
    });
    if (!company) {
      throw new NotFoundException(`Company ${jobPosition.companyUid} not found`);
    }
    const companyId = company.id;

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

  async list(paginationDto: PaginationDto, user: User): Promise<PaginatedResponse<HiringProcessResponseDto>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

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

  async findAll(hiringProcessFindDto: HiringProcessFindDto, user: User): Promise<Array<HiringProcessResponseDto>> {
    const where: any = hiringProcessFindDto.candidateUid ? { candidate: { uid: hiringProcessFindDto.candidateUid } } : {};

    // Add company filter for HR and USER roles
    const userCompanyId = getUserCompanyId(user);
    if (userCompanyId !== null) {
      where.companyId = userCompanyId;
    }

    const hiringProcesses = await this.databaseService.hiringProcess.findMany({
      include: includeHiringProcess,
      where,
    });
    return hiringProcesses.map((hp) => HiringProcessOneMapper(hp));
  }

  async findOne(uid: string, user?: User): Promise<HiringProcessResponseDto> {
    const hiringProcess = await this.databaseService.hiringProcess.findUnique({
      where: { uid },
      include: includeHiringProcess,
    });

    if (!hiringProcess) {
      throw new NotFoundException(`Hiring process ${uid} not found`);
    }

    // Verify company access if user is provided
    if (user) {
      verifyCompanyAccess(user, hiringProcess.companyId);
    }

    return HiringProcessOneMapper(hiringProcess);
  }

  async update(uid: string, updateHiringProcessDto: UpdateHiringProcessDto, user: User): Promise<HiringProcessResponseDto> {
    if (!uid) {
      throw new NotFoundException(`Hiring process ${uid} not found`);
    }

    // Verify company access before update
    const existingHiringProcess = await this.databaseService.hiringProcess.findUnique({
      where: { uid },
    });

    if (!existingHiringProcess) {
      throw new NotFoundException(`Hiring process ${uid} not found`);
    }

    verifyCompanyAccess(user, existingHiringProcess.companyId);

    const hiringProcess = await this.databaseService.hiringProcess.update({
      where: { uid },
      data: { ...updateHiringProcessDto },
      include: includeHiringProcess,
    });

    return HiringProcessOneMapper(hiringProcess);
  }

  async remove(uid: string, user: User): Promise<MessageResponseDto> {
    // Verify company access before delete
    const existingHiringProcess = await this.databaseService.hiringProcess.findUnique({
      where: { uid },
    });

    if (!existingHiringProcess) {
      throw new NotFoundException(`Hiring process ${uid} not found`);
    }

    verifyCompanyAccess(user, existingHiringProcess.companyId);

    const hiringProcess = await this.databaseService.hiringProcess.delete({
      where: { uid },
    });

    return { message: `Hiring Process deleted successfully` };
  }

  async progressToNextStage(hiringProcessUid: string, user: User) {
    // Verify company access before progressing stage
    const hiringProcess = await this.databaseService.hiringProcess.findUnique({
      where: { uid: hiringProcessUid },
    });

    if (!hiringProcess) {
      throw new NotFoundException(`Hiring process ${hiringProcessUid} not found`);
    }

    verifyCompanyAccess(user, hiringProcess.companyId);

    return this.stagesService.progressToNextStage(hiringProcessUid);
  }

  async moveToSpecificStage(hiringProcessUid: string, targetStageUid: string, user: User) {
    // Verify company access before moving to specific stage
    const hiringProcess = await this.databaseService.hiringProcess.findUnique({
      where: { uid: hiringProcessUid },
    });

    if (!hiringProcess) {
      throw new NotFoundException(`Hiring process ${hiringProcessUid} not found`);
    }

    verifyCompanyAccess(user, hiringProcess.companyId);

    return this.stagesService.moveToSpecificStage(hiringProcessUid, targetStageUid);
  }
}
