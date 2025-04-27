import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHiringProcessDto, HiringProcessFindDto, HiringProcessResponseDto, UpdateHiringProcessDto } from './dto/hiring-process.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { HiringProcessOneMapper, includeHiringProcess } from './entities/hiring-process.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { JobPositionService } from '../job-position/job-position.service';
import { CandidateService } from './modules/candidate/candidate.service';
import { StagesService } from './modules/stages/stages.service';

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

    const newHiringProcess = await this.databaseService.hiringProcess.create({
      data: {
        title: jobPosition.title + ' - ' + candidate.name,
        candidate: { connect: { uid: candidate.uid } },
        jobPosition: { connect: { uid: jobPosition.uid } },
      },
      include: includeHiringProcess,
    });

    const copiedStages = jobPosition.stages.map(({ uid, ...rest }) => ({ ...rest, jobPositionUid: jobPosition.uid, hiringProcessUid: newHiringProcess.uid }));
    await this.stagesService.bulkCreateStages(copiedStages);

    return HiringProcessOneMapper(newHiringProcess);
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
