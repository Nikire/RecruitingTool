import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { CandidateResponseDto, CreateCandidateDto, UpdateCandidateDto } from './dto/candidate.dto';
import { CandidateMapper } from './entities/candidate.entity';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { CandidateNoteResponseDto, CreateCandidateNoteDto, UpdateCandidateNoteDto } from './dto/candidate-note.dto';
import { User } from '@prisma/client';
import { getUserCompanyId, verifyCompanyAccess } from 'src/utils/company-access.helper';

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

  async findOne(uid: string, user?: User): Promise<CandidateResponseDto> {
    const candidate = await this.databaseService.candidate.findUnique({
      where: { uid },
      include: { hiringProcesses: true },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate ${uid} not found`);
    }

    // Verify company access if user is provided (through hiring processes)
    if (user && candidate.hiringProcesses && candidate.hiringProcesses.length > 0) {
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        // Check if candidate has at least one hiring process for this company
        const hasAccessToCandidate = candidate.hiringProcesses.some(hp => hp.companyId === userCompanyId);
        if (!hasAccessToCandidate) {
          throw new NotFoundException(`Candidate ${uid} not found`);
        }
      }
    }

    return CandidateMapper(candidate);
  }

  async list(paginationDto: PaginationDto, user: User): Promise<PaginatedResponse<CandidateResponseDto>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: any = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Add company filter for HR and USER roles (filter by hiring processes company)
    const userCompanyId = getUserCompanyId(user);
    if (userCompanyId !== null) {
      where.hiringProcesses = {
        some: {
          companyId: userCompanyId,
        },
      };
    }

    // Get total count
    const total = await this.databaseService.candidate.count({ where });

    // Get paginated data
    const candidates = await this.databaseService.candidate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { hiringProcesses: true },
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

  async findAll(user: User): Promise<Array<CandidateResponseDto>> {
    const where: any = {};

    // Add company filter for HR and USER roles (filter by hiring processes company)
    const userCompanyId = getUserCompanyId(user);
    if (userCompanyId !== null) {
      where.hiringProcesses = {
        some: {
          companyId: userCompanyId,
        },
      };
    }

    const candidates = await this.databaseService.candidate.findMany({
      where,
      include: { hiringProcesses: true },
    });
    return candidates.map((c) => CandidateMapper(c));
  }

  async update(uid: string, updateCandidateDto: UpdateCandidateDto, user: User): Promise<CandidateResponseDto> {
    if (!uid) {
      throw new NotFoundException(`Candidate ${uid} not found`);
    }

    // Verify company access before update (through hiring processes)
    const existingCandidate = await this.databaseService.candidate.findUnique({
      where: { uid },
      include: { hiringProcesses: true },
    });

    if (!existingCandidate) {
      throw new NotFoundException(`Candidate ${uid} not found`);
    }

    // Check if user has access to this candidate through any hiring process
    if (existingCandidate.hiringProcesses && existingCandidate.hiringProcesses.length > 0) {
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        const hasAccessToCandidate = existingCandidate.hiringProcesses.some(hp => hp.companyId === userCompanyId);
        if (!hasAccessToCandidate) {
          throw new NotFoundException(`Candidate ${uid} not found`);
        }
      }
    }

    const candidate = await this.databaseService.candidate.update({
      where: { uid },
      data: { ...updateCandidateDto },
    });

    return CandidateMapper(candidate);
  }

  async remove(uid: string, user: User): Promise<MessageResponseDto> {
    if (!uid) {
      throw new NotFoundException(`Candidate ${uid} not found`);
    }

    // Verify company access before delete (through hiring processes)
    const existingCandidate = await this.databaseService.candidate.findUnique({
      where: { uid },
      include: { hiringProcesses: true },
    });

    if (!existingCandidate) {
      throw new NotFoundException(`Candidate ${uid} not found`);
    }

    // Check if user has access to this candidate through any hiring process
    if (existingCandidate.hiringProcesses && existingCandidate.hiringProcesses.length > 0) {
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        const hasAccessToCandidate = existingCandidate.hiringProcesses.some(hp => hp.companyId === userCompanyId);
        if (!hasAccessToCandidate) {
          throw new NotFoundException(`Candidate ${uid} not found`);
        }
      }
    }

    const candidate = await this.databaseService.candidate.delete({ where: { uid } });

    return { message: `Candidate deleted successfully` };
  }

  // Candidate Notes methods
  async createNote(createNoteDto: CreateCandidateNoteDto, authorUserId: number): Promise<CandidateNoteResponseDto> {
    // Find candidate by UID to get the numeric ID
    const candidate = await this.databaseService.candidate.findUnique({
      where: { uid: createNoteDto.candidateUid },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate ${createNoteDto.candidateUid} not found`);
    }

    const note = await this.databaseService.candidateNote.create({
      data: {
        content: createNoteDto.content,
        candidateId: candidate.id,
        authorId: authorUserId,
      },
      include: {
        author: true,
        candidate: true,
      },
    });

    return {
      uid: note.uid,
      content: note.content,
      candidateUid: note.candidate.uid,
      authorUid: note.author.uid,
      authorName: note.author.name,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  async findNotesByCandidateUid(candidateUid: string): Promise<CandidateNoteResponseDto[]> {
    const candidate = await this.databaseService.candidate.findUnique({
      where: { uid: candidateUid },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate ${candidateUid} not found`);
    }

    const notes = await this.databaseService.candidateNote.findMany({
      where: { candidateId: candidate.id },
      include: {
        author: true,
        candidate: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((note) => ({
      uid: note.uid,
      content: note.content,
      candidateUid: note.candidate.uid,
      authorUid: note.author.uid,
      authorName: note.author.name,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));
  }

  async updateNote(noteUid: string, updateNoteDto: UpdateCandidateNoteDto, authorUserId: number): Promise<CandidateNoteResponseDto> {
    // First fetch the note to verify ownership
    const existingNote = await this.databaseService.candidateNote.findUnique({
      where: { uid: noteUid },
      include: {
        author: true,
        candidate: true,
      },
    });

    if (!existingNote) {
      throw new NotFoundException(`Note ${noteUid} not found`);
    }

    // Verify that the current user is the note author
    if (existingNote.authorId !== authorUserId) {
      throw new NotFoundException(`Note ${noteUid} not found`);
    }

    const note = await this.databaseService.candidateNote.update({
      where: { uid: noteUid },
      data: { content: updateNoteDto.content },
      include: {
        author: true,
        candidate: true,
      },
    });

    return {
      uid: note.uid,
      content: note.content,
      candidateUid: note.candidate.uid,
      authorUid: note.author.uid,
      authorName: note.author.name,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  async removeNote(noteUid: string, authorUserId: number): Promise<MessageResponseDto> {
    // First fetch the note to verify ownership
    const existingNote = await this.databaseService.candidateNote.findUnique({
      where: { uid: noteUid },
    });

    if (!existingNote) {
      throw new NotFoundException(`Note ${noteUid} not found`);
    }

    // Verify that the current user is the note author
    if (existingNote.authorId !== authorUserId) {
      throw new NotFoundException(`Note ${noteUid} not found`);
    }

    const note = await this.databaseService.candidateNote.delete({
      where: { uid: noteUid },
    });

    if (!note) {
      throw new NotFoundException(`Note ${noteUid} not found`);
    }

    return { message: 'Note deleted successfully' };
  }
}
