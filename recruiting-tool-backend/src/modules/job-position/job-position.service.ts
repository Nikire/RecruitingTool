import { NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CreateJobPositionDto, JobPositionResponseDto, UpdateJobPositionDto } from './dto/job-position.dto';
import { JobPositionMapper, JobPositionOneMapper } from './entities/job-position.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';

export class JobPositionService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<Array<JobPositionResponseDto>> {
    const jobPositions = await this.databaseService.jobPosition.findMany({
      include: { stages: true, hiringProcesses: true },
    });
    return jobPositions.map((jp) => JobPositionOneMapper(jp));
  }

  async findOne(uid: string): Promise<JobPositionResponseDto> {
    const jobPosition = await this.databaseService.jobPosition.findUnique({
      where: { uid },
      include: { stages: true, hiringProcesses: true },
    });

    if (!jobPosition) {
      throw new NotFoundException(`Job position ${uid} not found`);
    }

    return JobPositionOneMapper(jobPosition);
  }

  async create(creatorUid: string, createJobPositionDto: CreateJobPositionDto): Promise<JobPositionResponseDto> {
    const newJobPosition = await this.databaseService.jobPosition.create({
      data: {
        title: createJobPositionDto.title,
        createdBy: { connect: { uid: creatorUid } },
      },
    });
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
