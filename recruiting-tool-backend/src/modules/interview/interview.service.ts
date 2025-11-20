import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateInterviewDto, UpdateInterviewDto, InterviewResponseDto } from './dto/interview.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { InterviewMapper } from './entities/interview.entity';
import { InterviewStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';

@Injectable()
export class InterviewService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
  ) {}

  async create(createInterviewDto: CreateInterviewDto, scheduledByUid: string): Promise<InterviewResponseDto> {
    const { stageUid, scheduledDate, scheduledTime, duration, meetingLink, notes } = createInterviewDto;

    // Look up the full user by UID
    const scheduledBy = await this.databaseService.user.findUnique({
      where: { uid: scheduledByUid },
    });

    if (!scheduledBy) {
      throw new NotFoundException(`User with UID ${scheduledByUid} not found`);
    }

    // Get the stage and verify it exists
    const stage = await this.databaseService.stage.findUnique({
      where: { uid: stageUid },
      include: {
        hiringProcess: {
          include: {
            candidate: true,
          },
        },
      },
    });

    if (!stage) {
      throw new NotFoundException(`Stage with UID ${stageUid} not found`);
    }

    // Determine status based on whether date/time is provided
    const status = scheduledDate && scheduledTime ? InterviewStatus.SCHEDULED : InterviewStatus.PENDING;

    // Create the interview using the user from database lookup
    const interview = await this.databaseService.interview.create({
      data: {
        stage: {
          connect: { id: stage.id },
        },
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime,
        duration,
        status,
        meetingLink,
        notes,
        scheduledBy: {
          connect: { id: scheduledBy.id },
        },
      },
      include: {
        scheduledBy: true,
        stage: true,
      },
    });

    // Send email notification if interview is scheduled
    if (status === InterviewStatus.SCHEDULED && stage.hiringProcess?.candidate) {
      await this.emailService.sendInterviewScheduled(stage.hiringProcess.candidate, scheduledBy, interview);
    }

    return InterviewMapper(interview);
  }

  async findOne(uid: string): Promise<InterviewResponseDto> {
    const interview = await this.databaseService.interview.findUnique({
      where: { uid },
      include: {
        scheduledBy: true,
        stage: true,
      },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with UID ${uid} not found`);
    }

    return InterviewMapper(interview);
  }

  async findByStage(stageUid: string): Promise<InterviewResponseDto[]> {
    const stage = await this.databaseService.stage.findUnique({
      where: { uid: stageUid },
    });

    if (!stage) {
      throw new NotFoundException(`Stage with UID ${stageUid} not found`);
    }

    const interviews = await this.databaseService.interview.findMany({
      where: { stageId: stage.id },
      include: {
        scheduledBy: true,
        stage: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return interviews.map(InterviewMapper);
  }

  async update(uid: string, updateInterviewDto: UpdateInterviewDto): Promise<InterviewResponseDto> {
    const existingInterview = await this.databaseService.interview.findUnique({
      where: { uid },
      include: {
        stage: {
          include: {
            hiringProcess: {
              include: {
                candidate: true,
              },
            },
          },
        },
        scheduledBy: true,
      },
    });

    if (!existingInterview) {
      throw new NotFoundException(`Interview with UID ${uid} not found`);
    }

    const { scheduledDate, scheduledTime, duration, meetingLink, notes, status } = updateInterviewDto;

    // Auto-update status to SCHEDULED if date and time are provided
    let finalStatus = status;
    if (!finalStatus && scheduledDate && scheduledTime) {
      finalStatus = InterviewStatus.SCHEDULED;
    }

    const interview = await this.databaseService.interview.update({
      where: { uid },
      data: {
        ...(scheduledDate !== undefined && { scheduledDate: scheduledDate ? new Date(scheduledDate) : null }),
        ...(scheduledTime !== undefined && { scheduledTime }),
        ...(duration !== undefined && { duration }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(notes !== undefined && { notes }),
        ...(finalStatus !== undefined && { status: finalStatus }),
      },
      include: {
        scheduledBy: true,
        stage: true,
      },
    });

    return InterviewMapper(interview);
  }

  async cancel(uid: string, reason?: string): Promise<InterviewResponseDto> {
    const existingInterview = await this.databaseService.interview.findUnique({
      where: { uid },
      include: {
        stage: {
          include: {
            hiringProcess: {
              include: {
                candidate: true,
              },
            },
          },
        },
        scheduledBy: true,
      },
    });

    if (!existingInterview) {
      throw new NotFoundException(`Interview with UID ${uid} not found`);
    }

    if (existingInterview.status === InterviewStatus.CANCELLED) {
      throw new BadRequestException('Interview is already cancelled');
    }

    const interview = await this.databaseService.interview.update({
      where: { uid },
      data: { status: InterviewStatus.CANCELLED },
      include: {
        scheduledBy: true,
        stage: true,
      },
    });

    // Send cancellation email
    if (existingInterview.stage.hiringProcess?.candidate) {
      await this.emailService.sendInterviewCancelled(existingInterview.stage.hiringProcess.candidate, existingInterview.scheduledBy, existingInterview, reason);
    }

    return InterviewMapper(interview);
  }

  async remove(uid: string): Promise<{ message: string }> {
    const interview = await this.databaseService.interview.findUnique({
      where: { uid },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with UID ${uid} not found`);
    }

    await this.databaseService.interview.delete({
      where: { uid },
    });

    return { message: `Interview ${uid} deleted successfully` };
  }
}
