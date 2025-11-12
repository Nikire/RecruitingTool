import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { CandidateResponseDto, CreateCandidateDto, UpdateCandidateDto } from './dto/candidate.dto';
import { CandidateMapper } from './entities/candidate.entity';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';

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

  async list(paginationDto: PaginationDto): Promise<PaginatedResponse<CandidateResponseDto>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Get total count
    const total = await this.databaseService.candidate.count({ where });

    // Get paginated data
    const candidates = await this.databaseService.candidate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { hiringProcess: true },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: candidates.map((c) => CandidateMapper(c)),
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
