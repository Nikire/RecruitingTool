import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CreateInterviewDto, UpdateInterviewDto, InterviewResponseDto, RescheduleInterviewDto } from './dto/interview.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { InterviewMapper } from './entities/interview.entity';
import { InterviewStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';
import { SseService } from '../sse/sse.service';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly sseService: SseService,
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

    // Create Google Calendar event if user has connected calendar
    if (status === InterviewStatus.SCHEDULED && scheduledDate && scheduledTime) {
      try {
        const isCalendarConnected = await this.googleCalendarService.isCalendarConnected(scheduledBy.id);

        if (isCalendarConnected) {
          // Parse date and time to create ISO datetime strings
          const startDateTime = this.combineDateTime(scheduledDate, scheduledTime);
          const endDateTime = this.calculateEndTime(startDateTime, duration || 60);

          const calendarEvent = await this.googleCalendarService.createCalendarEvent(scheduledBy.id, {
            summary: `Interview: ${stage.hiringProcess.title}`,
            description: `Interview with ${stage.hiringProcess.candidate.name}\n\nStage: ${stage.title}\n${notes ? `\nNotes: ${notes}` : ''}`,
            startTime: startDateTime,
            endTime: endDateTime,
            location: location || undefined,
            attendees: [
              {
                email: stage.hiringProcess.candidate.email,
                displayName: stage.hiringProcess.candidate.name,
              },
            ],
            createMeetLink: !meetingLink, // Only create Meet link if no meeting link provided
          });

          // Update interview with Google Calendar event ID and meeting link if created
          if (calendarEvent.meetLink && !meetingLink) {
            await this.databaseService.interview.update({
              where: { id: interview.id },
              data: {
                meetingLink: calendarEvent.meetLink,
              },
            });
          }

          this.logger.log(`Created Google Calendar event for interview ${interview.uid}`);
        }
      } catch (error) {
        // Log error but don't fail the interview creation
        this.logger.error(`Failed to create Google Calendar event: ${error.message}`);
      }
    }

    // Emit SSE event for interview scheduled
    if (status === InterviewStatus.SCHEDULED && stage.hiringProcess?.candidate) {
      const jobPosition = await this.databaseService.jobPosition.findUnique({
        where: { id: stage.hiringProcess.jobPositionId },
        include: { company: true },
      });

      if (jobPosition) {
        this.sseService.emitInterviewScheduled(
          interview.uid,
          stage.hiringProcess.candidate.uid,
          stage.hiringProcess.candidate.name,
          scheduledBy.name,
          scheduledDate || '',
          location || 'TBD',
          jobPosition.title,
          stage.hiringProcess.uid,
          undefined, // userUid - send to all users
          jobPosition.company?.uid, // companyUid - filter by company
        );
      }
    }

    return InterviewMapper(interview);
  }

  /**
   * Combine date and time strings into ISO datetime
   */
  private combineDateTime(date: string, time: string): string {
    const dateObj = new Date(date);
    const [hours, minutes] = time.split(':');
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return dateObj.toISOString();
  }

  /**
   * Calculate end time by adding duration minutes
   */
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const endDate = new Date(startTime);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);
    return endDate.toISOString();
  }

  async findOne(uid: string): Promise<InterviewResponseDto> {
    const interview = await this.databaseService.interview.findFirst({
      where: { uid, deletedAt: null },
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
      where: { stageId: stage.id, deletedAt: null },
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

    // Soft delete: Set deletedAt instead of hard delete
    await this.databaseService.interview.update({
      where: { uid },
      data: { deletedAt: new Date() },
    });

    return { message: `Interview soft deleted successfully` };
  }

  async reschedule(uid: string, rescheduleDto: RescheduleInterviewDto, userUid: string): Promise<InterviewResponseDto> {
    const { newScheduledDate, newScheduledTime, reason, duration, meetingLink } = rescheduleDto;

    // Get existing interview with full details
    const existingInterview = await this.databaseService.interview.findUnique({
      where: { uid },
      include: {
        scheduledBy: true,
        stage: {
          include: {
            hiringProcess: {
              include: {
                candidate: true,
              },
            },
          },
        },
      },
    });

    if (!existingInterview) {
      throw new NotFoundException(`Interview with UID ${uid} not found`);
    }

    if (existingInterview.status === InterviewStatus.CANCELLED) {
      throw new BadRequestException('Cannot reschedule a cancelled interview');
    }

    if (existingInterview.status === InterviewStatus.COMPLETED) {
      throw new BadRequestException('Cannot reschedule a completed interview');
    }

    if (!existingInterview.scheduledDate || !existingInterview.scheduledTime) {
      throw new BadRequestException('Interview must be scheduled before it can be rescheduled');
    }

    // Get the user who is rescheduling
    const rescheduledBy = await this.databaseService.user.findUnique({
      where: { uid: userUid },
    });

    if (!rescheduledBy) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    // Create reschedule history record
    await this.databaseService.interviewReschedule.create({
      data: {
        interview: { connect: { id: existingInterview.id } },
        oldScheduledDate: existingInterview.scheduledDate,
        oldScheduledTime: existingInterview.scheduledTime,
        newScheduledDate: new Date(newScheduledDate),
        newScheduledTime,
        reason: reason || null,
        rescheduledBy: { connect: { id: rescheduledBy.id } },
      },
    });

    // Store original scheduled date if this is the first reschedule
    const originalScheduledDate = existingInterview.originalScheduledDate || existingInterview.scheduledDate;

    // Update interview with new schedule
    const updatedInterview = await this.databaseService.interview.update({
      where: { uid },
      data: {
        scheduledDate: new Date(newScheduledDate),
        scheduledTime: newScheduledTime,
        ...(duration !== undefined && { duration }),
        ...(meetingLink !== undefined && { meetingLink }),
        rescheduledCount: existingInterview.rescheduledCount + 1,
        originalScheduledDate,
        lastRescheduledAt: new Date(),
        rescheduledReason: reason || null,
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

    // Send reschedule notification email
    if (existingInterview.stage.hiringProcess?.candidate) {
      const candidate = existingInterview.stage.hiringProcess.candidate;
      await this.emailService.sendInterviewRescheduled(
        candidate.email,
        {
          candidateName: candidate.name,
          jobPosition: existingInterview.stage.hiringProcess.title,
          oldDate: existingInterview.scheduledDate,
          oldTime: existingInterview.scheduledTime,
          newDate: new Date(newScheduledDate),
          newTime: newScheduledTime,
          duration: duration || existingInterview.duration || undefined,
          location: updatedInterview.location || undefined,
          meetingLink: meetingLink || updatedInterview.meetingLink || undefined,
          interviewers: rescheduledBy.name ? [rescheduledBy.name] : [],
          reason: reason || undefined,
          hrName: rescheduledBy.name,
        },
        updatedInterview.uid,
      );
    }

    return InterviewMapper(updatedInterview);
  }

  async getRescheduleHistory(uid: string): Promise<any[]> {
    const interview = await this.databaseService.interview.findUnique({
      where: { uid },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with UID ${uid} not found`);
    }

    const reschedules = await this.databaseService.interviewReschedule.findMany({
      where: { interviewId: interview.id },
      include: {
        rescheduledBy: true,
      },
      orderBy: { rescheduledAt: 'desc' },
    });

    const { InterviewRescheduleMapper } = await import('./entities/interview.entity');
    return reschedules.map(InterviewRescheduleMapper);
  }
}
