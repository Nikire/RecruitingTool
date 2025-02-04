import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHiringProcessDto, HiringProcessResponseDto, UpdateHiringProcessDto } from './dto/hiring-process.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { HiringProcessMapper, HiringProcessOneMapper } from './entities/hiring-process.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';

@Injectable()
export class HiringProcessService {
  constructor(private databaseService: DatabaseService) {}

  async create(creatorUid: string, createHiringProcessDto: CreateHiringProcessDto): Promise<HiringProcessResponseDto> {
    const newHiringProcess = await this.databaseService.hiringProcess.create({
      data: {
        title: createHiringProcessDto.title,
        createdBy: { connect: { uid: creatorUid } },
        candidate: { connect: { uid: createHiringProcessDto.candidateUid } },
      },
    });
    return HiringProcessMapper(newHiringProcess);
  }

  async findAll(): Promise<Array<HiringProcessResponseDto>> {
    const hiringProcesses = await this.databaseService.hiringProcess.findMany({
      include: { candidate: true, stages: true },
    });
    return hiringProcesses.map((hp) => HiringProcessOneMapper(hp));
  }

  async findOne(uid: string): Promise<HiringProcessResponseDto> {
    const hiringProcess = await this.databaseService.hiringProcess.findUnique({
      where: { uid },
      include: { candidate: true, stages: true },
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
    });

    if (!hiringProcess) {
      throw new NotFoundException(`Hiring process ${uid} not found`);
    }
    return HiringProcessMapper(hiringProcess);
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
