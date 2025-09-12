import { forwardRef, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CreateJobPositionDto, JobPositionResponseDto, UpdateJobPositionDto } from './dto/job-position.dto';
import { includeJobPosition, JobPositionMapper, JobPositionOneMapper } from './entities/job-position.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { CandidateService } from '../hiring-process/modules/candidate/candidate.service';
import { HiringProcessService } from '../hiring-process/hiring-process.service';
import { StagesService } from '../hiring-process/modules/stages/stages.service';

export class JobPositionService {
  constructor(
    @Inject(DatabaseService) private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => HiringProcessService)) private readonly hiringProcessService: HiringProcessService,
    private readonly candidateService: CandidateService,
    private readonly stagesService: StagesService,
  ) {}

  async findAll(): Promise<Array<JobPositionResponseDto>> {
    const jobPositions = await this.databaseService.jobPosition.findMany({
      include: includeJobPosition,
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
    let newJobPosition = await this.databaseService.jobPosition.create({
      data: {
        title: createJobPositionDto.title,
        createdBy: { connect: { uid: creatorUid } },
      },
    });

    if (createJobPositionDto.stages) {
      const stages = createJobPositionDto.stages.map((stage) => ({ ...stage, jobPositionUid: newJobPosition.uid }));
      await this.stagesService.bulkCreateStages(stages);
    }

    return JobPositionMapper(newJobPosition);
  }

  async update(uid: string, updateHiringProcessDto: UpdateJobPositionDto): Promise<JobPositionResponseDto> {
    if (!uid) {
      throw new NotFoundException(`Job position ${uid} not found`);
    }

    const jobPosition = await this.databaseService.jobPosition.update({
      where: { uid },
      data: { ...updateHiringProcessDto },
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
}
