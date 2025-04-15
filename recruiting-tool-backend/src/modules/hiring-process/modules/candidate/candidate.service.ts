import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { CandidateResponseDto, CreateCandidateDto, UpdateCandidateDto } from './dto/candidate.dto';
import { CandidateMapper } from './entities/candidate.entity';

@Injectable()
export class CandidateService {
  constructor(private databaseService: DatabaseService) {}

  async create(createCandidateDto: CreateCandidateDto): Promise<CandidateResponseDto> {
    const candidate = await this.databaseService.candidate.create({
      data: {
        name: createCandidateDto.name,
        email: createCandidateDto.email,
      },
    });
    return CandidateMapper(candidate);
  }

  async findOne(uid: string): Promise<CandidateResponseDto> {
    const candidate = await this.databaseService.candidate.findUnique({
      where: { uid },
      include: { hiringProcess: true },
    });

    return CandidateMapper(candidate);
  }

  async findAll(): Promise<Array<CandidateResponseDto>> {
    const candidates = await this.databaseService.candidate.findMany({
      include: { hiringProcess: true },
    });
    return candidates.map((c) => CandidateMapper(c));
  }

  async update(uid: string, updateCandidateDto: UpdateCandidateDto): Promise<CandidateResponseDto> {
    if (!uid) {
      throw new NotFoundException(`Candidate ${uid} not found`);
    }

    const candidate = await this.databaseService.candidate.update({
      where: { uid },
      data: { ...updateCandidateDto },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate ${uid} not found`);
    }
    return CandidateMapper(candidate);
  }

  async remove(uid: string): Promise<MessageResponseDto> {
    if (!uid) {
      throw new NotFoundException(`Candidate ${uid} not found`);
    }

    const candidate = await this.databaseService.candidate.delete({ where: { uid } });

    if (!candidate) {
      throw new NotFoundException(`Candidate ${uid} not found`);
    }
    return { message: `Candidate deleted successfully` };
  }
}
