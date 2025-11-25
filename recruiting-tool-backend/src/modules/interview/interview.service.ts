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
    const { stageUid, scheduledDate, scheduledTime, duration, meetingLink, location, notes } = createInterviewDto;

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
        location,
        notes,
        scheduledBy: {
          connect: { id: scheduledBy.id },
        },
      },
      include: {
        scheduledBy: true,
        stage: true,
        interviewers: {
          include: {
            user: true,
          },
        },
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
        interviewers: {
          include: {
            user: true,
          },
        },
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
        interviewers: {
          include: {
            user: true,
          },
        },
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

    const { scheduledDate, scheduledTime, duration, meetingLink, location, notes, status } = updateInterviewDto;

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
        ...(location !== undefined && { location }),
        ...(notes !== undefined && { notes }),
        ...(finalStatus !== undefined && { status: finalStatus }),
      },
      include: {
        scheduledBy: true,
        stage: true,
        interviewers: {
          include: {
            user: true,
          },
        },
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
        interviewers: {
          include: {
            user: true,
          },
        },
      },
    });

    // Send cancellation email
    if (existingInterview.stage.hiringProcess?.candidate) {
      await this.emailService.sendInterviewCancelled(existingInterview.stage.hiringProcess.candidate, existingInterview.scheduledBy, existingInterview, reason);
    }

    return InterviewMapper(interview);
  }

  async complete(uid: string): Promise<InterviewResponseDto> {
    const existingInterview = await this.databaseService.interview.findUnique({
      where: { uid },
    });

    if (!existingInterview) {
      throw new NotFoundException(`Interview with UID ${uid} not found`);
    }

    if (existingInterview.status === InterviewStatus.COMPLETED) {
      throw new BadRequestException('Interview is already completed');
    }

    if (existingInterview.status === InterviewStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete a cancelled interview');
    }

    const interview = await this.databaseService.interview.update({
      where: { uid },
      data: { status: InterviewStatus.COMPLETED },
      include: {
        scheduledBy: true,
        stage: true,
        interviewers: {
          include: {
            user: true,
          },
        },
      },
    });

    return InterviewMapper(interview);
  }

  async addInterviewer(interviewUid: string, userUid: string, role?: string): Promise<InterviewResponseDto> {
    // Verify interview exists
    const interview = await this.databaseService.interview.findUnique({
      where: { uid: interviewUid },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with UID ${interviewUid} not found`);
    }

    // Verify user exists
    const user = await this.databaseService.user.findUnique({
      where: { uid: userUid },
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    // Check if interviewer already exists
    const existingInterviewer = await this.databaseService.interviewInterviewer.findUnique({
      where: {
        interviewId_userId: {
          interviewId: interview.id,
          userId: user.id,
        },
      },
    });

    if (existingInterviewer) {
      throw new BadRequestException('User is already an interviewer for this interview');
    }

    // Add interviewer
    await this.databaseService.interviewInterviewer.create({
      data: {
        interviewId: interview.id,
        userId: user.id,
        role,
      },
    });

    // Return updated interview
    return this.findOne(interviewUid);
  }

  async removeInterviewer(interviewUid: string, userUid: string): Promise<InterviewResponseDto> {
    // Verify interview exists
    const interview = await this.databaseService.interview.findUnique({
      where: { uid: interviewUid },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with UID ${interviewUid} not found`);
    }

    // Verify user exists
    const user = await this.databaseService.user.findUnique({
      where: { uid: userUid },
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    // Check if interviewer exists
    const interviewer = await this.databaseService.interviewInterviewer.findUnique({
      where: {
        interviewId_userId: {
          interviewId: interview.id,
          userId: user.id,
        },
      },
    });

    if (!interviewer) {
      throw new NotFoundException('User is not an interviewer for this interview');
    }

    // Remove interviewer
    await this.databaseService.interviewInterviewer.delete({
      where: {
        interviewId_userId: {
          interviewId: interview.id,
          userId: user.id,
        },
      },
    });

    // Return updated interview
    return this.findOne(interviewUid);
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
