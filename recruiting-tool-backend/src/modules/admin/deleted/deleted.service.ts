import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  DeletedCandidateDto,
  DeletedJobPositionDto,
  DeletedApplicationDto,
  DeletedInterviewDto,
  PurgeResponseDto,
} from './dto/deleted.dto';

@Injectable()
export class DeletedService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all soft-deleted candidates
   */
  async getDeletedCandidates(companyId?: number): Promise<DeletedCandidateDto[]> {
    const candidates = await this.prisma.candidate.findMany({
      where: {
        deletedAt: { not: null },
      },
      select: {
        uid: true,
        name: true,
        email: true,
        source: true,
        deletedAt: true,
        createdAt: true,
      },
      orderBy: { deletedAt: 'desc' },
    });

    return candidates.map((c) => ({
      uid: c.uid,
      name: c.name,
      email: c.email,
      source: c.source || undefined,
      deletedAt: c.deletedAt!,
      createdAt: c.createdAt,
    }));
  }

  /**
   * Get all soft-deleted job positions for a company
   */
  async getDeletedJobPositions(companyId: number): Promise<DeletedJobPositionDto[]> {
    const jobPositions = await this.prisma.jobPosition.findMany({
      where: {
        companyId,
        deletedAt: { not: null },
      },
      select: {
        uid: true,
        title: true,
        description: true,
        status: true,
        deletedAt: true,
        createdAt: true,
      },
      orderBy: { deletedAt: 'desc' },
    });

    return jobPositions.map((jp) => ({
      uid: jp.uid,
      title: jp.title,
      description: jp.description || undefined,
      status: jp.status,
      deletedAt: jp.deletedAt!,
      createdAt: jp.createdAt,
    }));
  }

  /**
   * Get all soft-deleted applications
   */
  async getDeletedApplications(companyId?: number): Promise<DeletedApplicationDto[]> {
    const applications = await this.prisma.application.findMany({
      where: {
        deletedAt: { not: null },
        ...(companyId && {
          jobPosition: {
            companyId,
          },
        }),
      },
      select: {
        uid: true,
        applicantName: true,
        applicantEmail: true,
        status: true,
        deletedAt: true,
        appliedAt: true,
      },
      orderBy: { deletedAt: 'desc' },
    });

    return applications.map((a) => ({
      uid: a.uid,
      applicantName: a.applicantName,
      applicantEmail: a.applicantEmail,
      status: a.status,
      deletedAt: a.deletedAt!,
      appliedAt: a.appliedAt,
    }));
  }

  /**
   * Get all soft-deleted interviews
   */
  async getDeletedInterviews(companyId?: number): Promise<DeletedInterviewDto[]> {
    const interviews = await this.prisma.interview.findMany({
      where: {
        deletedAt: { not: null },
        ...(companyId && {
          stage: {
            hiringProcess: {
              companyId,
            },
          },
        }),
      },
      select: {
        uid: true,
        scheduledDate: true,
        status: true,
        deletedAt: true,
        createdAt: true,
      },
      orderBy: { deletedAt: 'desc' },
    });

    return interviews.map((i) => ({
      uid: i.uid,
      scheduledDate: i.scheduledDate || undefined,
      status: i.status,
      deletedAt: i.deletedAt!,
      createdAt: i.createdAt,
    }));
  }

  /**
   * Restore a soft-deleted candidate
   */
  async restoreCandidate(uid: string): Promise<DeletedCandidateDto> {
    const candidate = await this.prisma.candidate.findUnique({
      where: { uid },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with UID ${uid} not found`);
    }

    if (!candidate.deletedAt) {
      throw new NotFoundException(`Candidate with UID ${uid} is not deleted`);
    }

    const restored = await this.prisma.candidate.update({
      where: { uid },
      data: { deletedAt: null },
      select: {
        uid: true,
        name: true,
        email: true,
        source: true,
        deletedAt: true,
        createdAt: true,
      },
    });

    return {
      uid: restored.uid,
      name: restored.name,
      email: restored.email,
      source: restored.source || undefined,
      deletedAt: restored.deletedAt!,
      createdAt: restored.createdAt,
    };
  }

  /**
   * Restore a soft-deleted job position
   */
  async restoreJobPosition(uid: string, companyId: number): Promise<DeletedJobPositionDto> {
    const jobPosition = await this.prisma.jobPosition.findUnique({
      where: { uid },
    });

    if (!jobPosition || jobPosition.companyId !== companyId) {
      throw new NotFoundException(`Job position with UID ${uid} not found`);
    }

    if (!jobPosition.deletedAt) {
      throw new NotFoundException(`Job position with UID ${uid} is not deleted`);
    }

    const restored = await this.prisma.jobPosition.update({
      where: { uid },
      data: { deletedAt: null },
      select: {
        uid: true,
        title: true,
        description: true,
        status: true,
        deletedAt: true,
        createdAt: true,
      },
    });

    return {
      uid: restored.uid,
      title: restored.title,
      description: restored.description || undefined,
      status: restored.status,
      deletedAt: restored.deletedAt!,
      createdAt: restored.createdAt,
    };
  }

  /**
   * Restore a soft-deleted application
   */
  async restoreApplication(uid: string): Promise<DeletedApplicationDto> {
    const application = await this.prisma.application.findUnique({
      where: { uid },
    });

    if (!application) {
      throw new NotFoundException(`Application with UID ${uid} not found`);
    }

    if (!application.deletedAt) {
      throw new NotFoundException(`Application with UID ${uid} is not deleted`);
    }

    const restored = await this.prisma.application.update({
      where: { uid },
      data: { deletedAt: null },
      select: {
        uid: true,
        applicantName: true,
        applicantEmail: true,
        status: true,
        deletedAt: true,
        appliedAt: true,
      },
    });

    return {
      uid: restored.uid,
      applicantName: restored.applicantName,
      applicantEmail: restored.applicantEmail,
      status: restored.status,
      deletedAt: restored.deletedAt!,
      appliedAt: restored.appliedAt,
    };
  }

  /**
   * Restore a soft-deleted interview
   */
  async restoreInterview(uid: string): Promise<DeletedInterviewDto> {
    const interview = await this.prisma.interview.findUnique({
      where: { uid },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with UID ${uid} not found`);
    }

    if (!interview.deletedAt) {
      throw new NotFoundException(`Interview with UID ${uid} is not deleted`);
    }

    const restored = await this.prisma.interview.update({
      where: { uid },
      data: { deletedAt: null },
      select: {
        uid: true,
        scheduledDate: true,
        status: true,
        deletedAt: true,
        createdAt: true,
      },
    });

    return {
      uid: restored.uid,
      scheduledDate: restored.scheduledDate || undefined,
      status: restored.status,
      deletedAt: restored.deletedAt!,
      createdAt: restored.createdAt,
    };
  }

  /**
   * Permanently delete a candidate (GDPR compliance)
   */
  async purgeCandidate(uid: string): Promise<PurgeResponseDto> {
    const candidate = await this.prisma.candidate.findUnique({
      where: { uid },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with UID ${uid} not found`);
    }

    await this.prisma.candidate.delete({
      where: { uid },
    });

    return {
      success: true,
      message: `Candidate ${uid} permanently deleted`,
    };
  }

  /**
   * Permanently delete a job position (GDPR compliance)
   */
  async purgeJobPosition(uid: string, companyId: number): Promise<PurgeResponseDto> {
    const jobPosition = await this.prisma.jobPosition.findUnique({
      where: { uid },
    });

    if (!jobPosition || jobPosition.companyId !== companyId) {
      throw new NotFoundException(`Job position with UID ${uid} not found`);
    }

    await this.prisma.jobPosition.delete({
      where: { uid },
    });

    return {
      success: true,
      message: `Job position ${uid} permanently deleted`,
    };
  }

  /**
   * Permanently delete an application (GDPR compliance)
   */
  async purgeApplication(uid: string): Promise<PurgeResponseDto> {
    const application = await this.prisma.application.findUnique({
      where: { uid },
    });

    if (!application) {
      throw new NotFoundException(`Application with UID ${uid} not found`);
    }

    await this.prisma.application.delete({
      where: { uid },
    });

    return {
      success: true,
      message: `Application ${uid} permanently deleted`,
    };
  }

  /**
   * Permanently delete an interview (GDPR compliance)
   */
  async purgeInterview(uid: string): Promise<PurgeResponseDto> {
    const interview = await this.prisma.interview.findUnique({
      where: { uid },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with UID ${uid} not found`);
    }

    await this.prisma.interview.delete({
      where: { uid },
    });

    return {
      success: true,
      message: `Interview ${uid} permanently deleted`,
    };
  }
}
