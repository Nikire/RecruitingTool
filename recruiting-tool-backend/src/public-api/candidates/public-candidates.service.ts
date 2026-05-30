import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from '../../modules/shared/modules/database/database.service';
import { ApplicationSource, Prisma } from '@prisma/client';
import { CreatePublicCandidateDto } from './dto/create-public-candidate.dto';
import { UpdatePublicCandidateDto } from './dto/update-public-candidate.dto';
import { PublicCandidateResponseDto } from './dto/public-candidate-response.dto';
import { PublicCandidatesListResponseDto } from './dto/public-candidates-list-response.dto';

@Injectable()
export class PublicCandidatesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    companyId: number,
    query: {
      page?: number;
      limit?: number;
      source?: string;
    },
  ): Promise<PublicCandidatesListResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.CandidateWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (query.source) {
      where.source = query.source as ApplicationSource;
    }

    const [candidates, total] = await Promise.all([
      this.db.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.candidate.count({ where }),
    ]);

    return {
      data: candidates.map((c) => this.toResponseDto(c)),
      total,
      page,
      limit,
      hasMore: skip + candidates.length < total,
    };
  }

  async findOne(uid: string, companyId: number): Promise<PublicCandidateResponseDto> {
    const candidate = await this.db.candidate.findFirst({
      where: { uid, companyId, deletedAt: null },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with uid "${uid}" not found`);
    }

    return this.toResponseDto(candidate);
  }

  async create(companyId: number, dto: CreatePublicCandidateDto): Promise<PublicCandidateResponseDto> {
    const existing = await this.db.candidate.findFirst({
      where: { email: dto.email, companyId },
    });

    if (existing) {
      throw new ConflictException(`A candidate with email "${dto.email}" already exists`);
    }

    const candidate = await this.db.candidate.create({
      data: {
        name: dto.name,
        email: dto.email,
        source: dto.source ?? ApplicationSource.MANUAL,
        sourceDetails: dto.sourceDetails ?? null,
        sourceUrl: dto.sourceUrl ?? null,
        companyId,
      },
    });

    this.eventEmitter.emit('webhook.deliver', {
      event: 'candidate.created',
      companyId,
      payload: { uid: candidate.uid, name: candidate.name, email: candidate.email },
    });

    return this.toResponseDto(candidate);
  }

  async update(uid: string, companyId: number, dto: UpdatePublicCandidateDto): Promise<PublicCandidateResponseDto> {
    const candidate = await this.db.candidate.findFirst({
      where: { uid, companyId, deletedAt: null },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with uid "${uid}" not found`);
    }

    if (dto.email && dto.email !== candidate.email) {
      const emailConflict = await this.db.candidate.findFirst({
        where: { email: dto.email, companyId },
      });
      if (emailConflict) {
        throw new ConflictException(`A candidate with email "${dto.email}" already exists`);
      }
    }

    const updated = await this.db.candidate.update({
      where: { id: candidate.id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.source !== undefined && { source: dto.source }),
        ...(dto.sourceDetails !== undefined && { sourceDetails: dto.sourceDetails }),
        ...(dto.sourceUrl !== undefined && { sourceUrl: dto.sourceUrl }),
      },
    });

    this.eventEmitter.emit('webhook.deliver', {
      event: 'candidate.updated',
      companyId,
      payload: { uid: updated.uid, name: updated.name, email: updated.email },
    });

    return this.toResponseDto(updated);
  }

  async remove(uid: string, companyId: number): Promise<void> {
    const candidate = await this.db.candidate.findFirst({
      where: { uid, companyId, deletedAt: null },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with uid "${uid}" not found`);
    }

    // Soft delete
    await this.db.candidate.update({
      where: { id: candidate.id },
      data: { deletedAt: new Date() },
    });
  }

  private toResponseDto(candidate: {
    uid: string;
    name: string;
    email: string;
    source: ApplicationSource | null;
    sourceDetails: string | null;
    sourceUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): PublicCandidateResponseDto {
    return {
      uid: candidate.uid,
      name: candidate.name,
      email: candidate.email,
      source: candidate.source,
      sourceDetails: candidate.sourceDetails,
      sourceUrl: candidate.sourceUrl,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    };
  }
}
