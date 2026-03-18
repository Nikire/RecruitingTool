import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import {
  CreateInterviewDto,
  UpdateInterviewDto,
  InterviewResponseDto,
  RescheduleInterviewDto,
  CheckAvailabilityDto,
  AvailabilityCheckResponseDto,
  ConflictDto,
  AlternativeSlotDto,
  GetCalendarInterviewsDto,
  CalendarInterviewResponseDto,
} from './dto/interview.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { InterviewMapper } from './entities/interview.entity';
import { InterviewStatus, User, NotificationType } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';
import { InterviewCalendarService } from './interview-calendar.service';
import { SseService } from '../sse/sse.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { getUserCompanyId } from 'src/utils/company-access.helper';
import { EntityNotFoundException } from 'src/common/exceptions';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly interviewCalendarService: InterviewCalendarService,
    private readonly sseService: SseService,
    private readonly auditLogService: AuditLogService,
    private readonly notificationsService: NotificationsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createInterviewDto: CreateInterviewDto, scheduledByUid: string): Promise<InterviewResponseDto> {
    const { stageUid, scheduledDate, scheduledTime, duration, meetingLink, location, notes, organizerUid } = createInterviewDto;

    // Look up the full user by UID
    const scheduledBy = await this.databaseService.user.findUnique({
      where: { uid: scheduledByUid },
    });

    if (!scheduledBy) {
      throw new NotFoundException(`User with UID ${scheduledByUid} not found`);
    }

    // Resolve organizer: use provided organizerUid or fall back to the requesting user
    let organizerId: number | null = null;
    if (organizerUid) {
      const organizer = await this.databaseService.user.findUnique({
        where: { uid: organizerUid },
      });
      if (!organizer) {
        throw new NotFoundException(`Organizer with UID ${organizerUid} not found`);
      }
      organizerId = organizer.id;
    } else {
      organizerId = scheduledBy.id;
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
        ...(organizerId !== null && {
          organizer: {
            connect: { id: organizerId },
          },
        }),
      },
      include: {
        scheduledBy: true,
        organizer: true,
        stage: true,
        interviewers: {
          include: {
            user: true,
          },
        },
      },
    });

    // Create Google Calendar event and store event ID and Meet link BEFORE sending email
    if (status === InterviewStatus.SCHEDULED && scheduledDate && scheduledTime) {
      const calendarEvent = await this.interviewCalendarService.createCalendarEvent(
        {
          ...interview,
          stage: {
            title: stage.title,
            hiringProcess: stage.hiringProcess,
          },
        },
        scheduledBy,
      );

      // Update interview with calendar event ID and Meet link if created
      if (calendarEvent) {
        const updateData: any = { calendarEventId: calendarEvent.id };

        // If no meetingLink was provided and Google Meet link was generated, save it
        if (!interview.meetingLink && calendarEvent.meetLink) {
          updateData.meetingLink = calendarEvent.meetLink;
          this.logger.log(`Saved Google Meet link for interview ${interview.uid}: ${calendarEvent.meetLink}`);
        }

        await this.databaseService.interview.update({
          where: { id: interview.id },
          data: updateData,
        });

        // Update the interview object with the new meetingLink so it's included in email
        if (calendarEvent.meetLink && !interview.meetingLink) {
          interview.meetingLink = calendarEvent.meetLink;
        }
      }
    }

    // Send email notification AFTER calendar event creation (so Meet link is included)
    if (status === InterviewStatus.SCHEDULED && stage.hiringProcess?.candidate) {
      await this.emailService.sendInterviewScheduled(stage.hiringProcess.candidate, scheduledBy, interview);
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

        // Create notification for HR users about interview scheduled
        const hrUsers = await this.databaseService.user.findMany({
          where: {
            companyId: jobPosition.companyId,
            roles: { hasSome: ['HR', 'HR_MANAGER', 'RECRUITER'] },
          },
        });

        for (const hrUser of hrUsers) {
          try {
            await this.notificationsService.create({
              userUid: hrUser.uid,
              type: NotificationType.INTERVIEW_SCHEDULED,
              title: 'Interview Scheduled',
              message: `Interview scheduled for ${stage.hiringProcess.candidate.name} on ${scheduledDate} at ${scheduledTime}`,
              metadata: {
                interviewUid: interview.uid,
                candidateUid: stage.hiringProcess.candidate.uid,
                candidateName: stage.hiringProcess.candidate.name,
                jobPositionUid: jobPosition.uid,
                jobPositionTitle: jobPosition.title,
                scheduledDate,
                scheduledTime,
              },
            });
          } catch (error) {
            this.logger.error(`Failed to create notification for user ${hrUser.uid}: ${error.message}`);
          }
        }
      }
    }

    return InterviewMapper(interview);
  }

  async findOne(uid: string, user?: User): Promise<InterviewResponseDto> {
    const interview = await this.databaseService.interview.findFirst({
      where: { uid, deletedAt: null },
      include: {
        scheduledBy: true,
        organizer: true,
        stage: {
          include: {
            hiringProcess: true,
            JobPosition: true,
          },
        },
        interviewers: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!interview) {
      throw new EntityNotFoundException('Interview', uid);
    }

    // Verify company access if user is provided
    if (user) {
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        const interviewCompanyId = interview.stage.hiringProcess?.companyId || interview.stage.JobPosition?.companyId;
        if (interviewCompanyId !== userCompanyId) {
          throw new EntityNotFoundException('Interview', uid);
        }
      }
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
        organizer: true,
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

  async update(uid: string, updateInterviewDto: UpdateInterviewDto, user?: User): Promise<InterviewResponseDto> {
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
            JobPosition: true,
          },
        },
        scheduledBy: true,
      },
    });

    if (!existingInterview) {
      throw new EntityNotFoundException('Interview', uid);
    }

    // Verify company access if user is provided
    if (user) {
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        const interviewCompanyId = existingInterview.stage.hiringProcess?.companyId || existingInterview.stage.JobPosition?.companyId;
        if (interviewCompanyId !== userCompanyId) {
          throw new EntityNotFoundException('Interview', uid);
        }
      }
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
        organizer: true,
        stage: {
          include: {
            hiringProcess: {
              include: {
                candidate: true,
              },
            },
          },
        },
        interviewers: {
          include: {
            user: true,
          },
        },
      },
    });

    // Sync calendar event if interview is scheduled and has calendar event ID
    if (interview.status === InterviewStatus.SCHEDULED && interview.calendarEventId) {
      await this.interviewCalendarService.updateCalendarEvent(
        {
          ...interview,
          stage: {
            title: interview.stage.title,
            hiringProcess: interview.stage.hiringProcess,
          },
        },
        existingInterview.scheduledBy,
      );
    }

    // Create notification for HR users about interview update
    if (interview.stage.hiringProcess?.candidate) {
      const jobPosition = await this.databaseService.jobPosition.findUnique({
        where: { id: interview.stage.hiringProcess.jobPositionId },
      });

      if (jobPosition) {
        const hrUsers = await this.databaseService.user.findMany({
          where: {
            companyId: jobPosition.companyId,
            roles: { hasSome: ['HR', 'HR_MANAGER', 'RECRUITER'] },
          },
        });

        for (const hrUser of hrUsers) {
          try {
            await this.notificationsService.create({
              userUid: hrUser.uid,
              type: NotificationType.INTERVIEW_UPDATED,
              title: 'Interview Updated',
              message: `Interview for ${interview.stage.hiringProcess.candidate.name} has been updated`,
              metadata: {
                interviewUid: interview.uid,
                candidateUid: interview.stage.hiringProcess.candidate.uid,
                candidateName: interview.stage.hiringProcess.candidate.name,
                jobPositionUid: jobPosition.uid,
                jobPositionTitle: jobPosition.title,
              },
            });
          } catch (error) {
            this.logger.error(`Failed to create notification for user ${hrUser.uid}: ${error.message}`);
          }
        }
      }
    }

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
        organizer: true,
        stage: true,
        interviewers: {
          include: {
            user: true,
          },
        },
      },
    });

    // Delete Google Calendar event if exists
    if (existingInterview.calendarEventId) {
      await this.interviewCalendarService.deleteCalendarEvent(existingInterview, existingInterview.scheduledBy);
    }

    // Send cancellation email
    if (existingInterview.stage.hiringProcess?.candidate) {
      await this.emailService.sendInterviewCancelled(existingInterview.stage.hiringProcess.candidate, existingInterview.scheduledBy, existingInterview, reason);

      // Create notification for HR users about interview cancellation
      const jobPosition = await this.databaseService.jobPosition.findUnique({
        where: { id: existingInterview.stage.hiringProcess.jobPositionId },
      });

      if (jobPosition) {
        const hrUsers = await this.databaseService.user.findMany({
          where: {
            companyId: jobPosition.companyId,
            roles: { hasSome: ['HR', 'HR_MANAGER', 'RECRUITER'] },
          },
        });

        for (const hrUser of hrUsers) {
          try {
            await this.notificationsService.create({
              userUid: hrUser.uid,
              type: NotificationType.INTERVIEW_CANCELLED,
              title: 'Interview Cancelled',
              message: `Interview for ${existingInterview.stage.hiringProcess.candidate.name} has been cancelled${reason ? `: ${reason}` : ''}`,
              metadata: {
                interviewUid: existingInterview.uid,
                candidateUid: existingInterview.stage.hiringProcess.candidate.uid,
                candidateName: existingInterview.stage.hiringProcess.candidate.name,
                jobPositionUid: jobPosition.uid,
                jobPositionTitle: jobPosition.title,
                reason,
              },
            });
          } catch (error) {
            this.logger.error(`Failed to create notification for user ${hrUser.uid}: ${error.message}`);
          }
        }
      }
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
        organizer: true,
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

    // Sync calendar attendees if calendar event exists
    if (interview.calendarEventId && interview.status === InterviewStatus.SCHEDULED) {
      await this.interviewCalendarService.syncAttendees(
        {
          ...interview,
          stage: {
            title: interview.stage.title,
            hiringProcess: interview.stage.hiringProcess,
          },
        },
        interview.scheduledBy,
      );
    }

    // Return updated interview
    return this.findOne(interviewUid);
  }

  async removeInterviewer(interviewUid: string, userUid: string): Promise<InterviewResponseDto> {
    // Verify interview exists
    const interview = await this.databaseService.interview.findUnique({
      where: { uid: interviewUid },
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

    // Sync calendar attendees if calendar event exists
    if (interview.calendarEventId && interview.status === InterviewStatus.SCHEDULED) {
      await this.interviewCalendarService.syncAttendees(
        {
          ...interview,
          stage: {
            title: interview.stage.title,
            hiringProcess: interview.stage.hiringProcess,
          },
        },
        interview.scheduledBy,
      );
    }

    // Return updated interview
    return this.findOne(interviewUid);
  }

  async remove(uid: string, user: User): Promise<{ message: string }> {
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

    // Log audit trail
    await this.auditLogService.logAction({
      action: 'SOFT_DELETE',
      entityType: 'Interview',
      entityId: interview.id,
      entityUid: interview.uid,
      user,
      metadata: {
        stageId: interview.stageId,
        scheduledDate: interview.scheduledDate,
        status: interview.status,
      },
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
        organizer: true,
        stage: {
          include: {
            hiringProcess: {
              include: {
                candidate: true,
              },
            },
          },
        },
        interviewers: {
          include: {
            user: true,
          },
        },
      },
    });

    // Update Google Calendar event if exists
    if (existingInterview.calendarEventId) {
      await this.interviewCalendarService.updateCalendarEvent(
        {
          ...updatedInterview,
          stage: {
            title: existingInterview.stage.title,
            hiringProcess: existingInterview.stage.hiringProcess,
          },
        },
        existingInterview.scheduledBy,
      );
    }

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

  /**
   * Check availability of interviewers for a proposed time slot
   * Detects conflicts and optionally suggests alternative time slots
   */
  async checkAvailability(dto: CheckAvailabilityDto): Promise<AvailabilityCheckResponseDto> {
    const { interviewerUids, proposedStartTime, duration, timeZone, bufferMinutes = 15, suggestAlternatives = true } = dto;

    // Generate cache key
    const cacheKey = `availability:${interviewerUids.sort().join(',')}:${proposedStartTime}:${duration}:${bufferMinutes}`;

    // Check cache first (5-minute TTL)
    const cached = await this.cacheManager.get<AvailabilityCheckResponseDto>(cacheKey);
    if (cached) {
      this.logger.log(`Returning cached availability check for ${interviewerUids.length} interviewers`);
      return cached;
    }

    // Calculate end time with buffer
    const proposedEndTime = this.addMinutes(proposedStartTime, duration);
    const bufferedStartTime = this.addMinutes(proposedStartTime, -bufferMinutes);
    const bufferedEndTime = this.addMinutes(proposedEndTime, bufferMinutes);

    // Get all interviewers
    const interviewers = await this.databaseService.user.findMany({
      where: {
        uid: { in: interviewerUids },
      },
      select: {
        id: true,
        uid: true,
        name: true,
        email: true,
        googleRefreshToken: true,
      },
    });

    if (interviewers.length !== interviewerUids.length) {
      const foundUids = interviewers.map((i) => i.uid);
      const missingUids = interviewerUids.filter((uid) => !foundUids.includes(uid));
      throw new NotFoundException(`Interviewers not found: ${missingUids.join(', ')}`);
    }

    // Detect conflicts for each interviewer
    const conflicts: ConflictDto[] = [];

    for (const interviewer of interviewers) {
      // Skip if user hasn't connected Google Calendar
      if (!interviewer.googleRefreshToken) {
        this.logger.warn(`Interviewer ${interviewer.uid} has not connected Google Calendar, skipping availability check`);
        conflicts.push({
          interviewerUid: interviewer.uid,
          interviewerName: interviewer.name,
          conflictStart: bufferedStartTime,
          conflictEnd: bufferedEndTime,
          conflictType: 'calendar_not_connected',
        });
        continue;
      }

      try {
        // Check availability using Google Calendar FreeBusy API
        const availability = await this.googleCalendarService.getAvailability(interviewer.id, {
          startDate: bufferedStartTime,
          endDate: bufferedEndTime,
          timeZone,
        });

        // If interviewer is busy, add to conflicts
        if (availability.busy) {
          // Find the specific busy slots that overlap with the proposed time
          const overlappingSlots = this.findOverlappingSlots(availability.availableSlots, bufferedStartTime, bufferedEndTime);

          for (const slot of overlappingSlots) {
            conflicts.push({
              interviewerUid: interviewer.uid,
              interviewerName: interviewer.name,
              conflictStart: slot.start,
              conflictEnd: slot.end,
              conflictType: 'calendar_event',
            });
          }
        }
      } catch (error) {
        this.logger.error(`Failed to check availability for interviewer ${interviewer.uid}: ${error.message}`);
        conflicts.push({
          interviewerUid: interviewer.uid,
          interviewerName: interviewer.name,
          conflictStart: bufferedStartTime,
          conflictEnd: bufferedEndTime,
          conflictType: 'availability_check_failed',
        });
      }
    }

    const available = conflicts.length === 0;

    // Suggest alternative slots if requested and there are conflicts
    let alternativeSlots: AlternativeSlotDto[] = [];
    if (!available && suggestAlternatives) {
      alternativeSlots = await this.suggestAlternativeSlots(interviewers, proposedStartTime, duration, bufferMinutes, timeZone);
    }

    const response: AvailabilityCheckResponseDto = {
      available,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
      alternativeSlots: alternativeSlots.length > 0 ? alternativeSlots : undefined,
      checkedAt: new Date(),
    };

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, response, 300000); // 5 minutes in milliseconds

    this.logger.log(`Availability check completed: ${available ? 'Available' : `${conflicts.length} conflict(s) found`}`);

    return response;
  }

  /**
   * Find busy slots that overlap with the proposed time range
   */
  private findOverlappingSlots(availableSlots: Array<{ startTime: string; endTime: string }>, proposedStart: string, proposedEnd: string): Array<{ start: string; end: string }> {
    const proposedStartTime = new Date(proposedStart).getTime();
    const proposedEndTime = new Date(proposedEnd).getTime();

    // If there are available slots, we need to find the gaps (busy periods)
    // For simplicity, we'll infer busy periods by checking if proposed time falls outside available slots
    const overlapping: Array<{ start: string; end: string }> = [];

    if (availableSlots.length === 0) {
      // No available slots means the entire period is busy
      return [{ start: proposedStart, end: proposedEnd }];
    }

    // Check if proposed time overlaps with any available slot
    let hasAvailableOverlap = false;
    for (const slot of availableSlots) {
      const slotStart = new Date(slot.startTime).getTime();
      const slotEnd = new Date(slot.endTime).getTime();

      // If proposed time is fully contained in an available slot, no conflict
      if (proposedStartTime >= slotStart && proposedEndTime <= slotEnd) {
        hasAvailableOverlap = true;
        break;
      }
    }

    // If no available slot fully contains the proposed time, there's a conflict
    if (!hasAvailableOverlap) {
      overlapping.push({ start: proposedStart, end: proposedEnd });
    }

    return overlapping;
  }

  /**
   * Suggest alternative time slots when the proposed time has conflicts
   * Finds the next 3-5 available slots within the next 7 days
   */
  private async suggestAlternativeSlots(
    interviewers: Array<{ id: number; uid: string; name: string; googleRefreshToken: string | null }>,
    proposedStartTime: string,
    duration: number,
    bufferMinutes: number,
    timeZone?: string,
  ): Promise<AlternativeSlotDto[]> {
    const alternatives: AlternativeSlotDto[] = [];
    const proposedDate = new Date(proposedStartTime);

    // Search for slots in the next 7 days
    const searchEndDate = new Date(proposedDate);
    searchEndDate.setDate(searchEndDate.getDate() + 7);

    // Define business hours (9 AM to 5 PM)
    const businessHourStart = 9;
    const businessHourEnd = 17;

    // Generate candidate slots (every 30 minutes during business hours)
    const candidateSlots: Array<{ start: Date; end: Date }> = [];
    let currentSlot = new Date(proposedDate);
    currentSlot.setHours(businessHourStart, 0, 0, 0);

    // Start from the next 30-minute increment after proposed time
    if (currentSlot < proposedDate) {
      currentSlot = new Date(proposedDate);
      currentSlot.setMinutes(Math.ceil(currentSlot.getMinutes() / 30) * 30);
    }

    while (currentSlot < searchEndDate && alternatives.length < 5) {
      // Skip weekends
      if (currentSlot.getDay() === 0 || currentSlot.getDay() === 6) {
        currentSlot.setDate(currentSlot.getDate() + 1);
        currentSlot.setHours(businessHourStart, 0, 0, 0);
        continue;
      }

      // Skip outside business hours
      if (currentSlot.getHours() >= businessHourEnd) {
        currentSlot.setDate(currentSlot.getDate() + 1);
        currentSlot.setHours(businessHourStart, 0, 0, 0);
        continue;
      }

      const slotEnd = this.addMinutes(currentSlot.toISOString(), duration);

      // Skip if slot extends past business hours
      if (new Date(slotEnd).getHours() > businessHourEnd) {
        currentSlot.setDate(currentSlot.getDate() + 1);
        currentSlot.setHours(businessHourStart, 0, 0, 0);
        continue;
      }

      candidateSlots.push({ start: new Date(currentSlot), end: new Date(slotEnd) });

      // Move to next 30-minute slot
      currentSlot.setMinutes(currentSlot.getMinutes() + 30);
    }

    // Check each candidate slot for availability
    for (const slot of candidateSlots) {
      if (alternatives.length >= 5) break;

      const unavailableInterviewers: string[] = [];
      let allAvailable = true;

      const bufferedStart = this.addMinutes(slot.start.toISOString(), -bufferMinutes);
      const bufferedEnd = this.addMinutes(slot.end.toISOString(), bufferMinutes);

      for (const interviewer of interviewers) {
        // Skip if calendar not connected
        if (!interviewer.googleRefreshToken) {
          unavailableInterviewers.push(interviewer.uid);
          allAvailable = false;
          continue;
        }

        try {
          const availability = await this.googleCalendarService.getAvailability(interviewer.id, {
            startDate: bufferedStart,
            endDate: bufferedEnd,
            timeZone,
          });

          if (availability.busy) {
            unavailableInterviewers.push(interviewer.uid);
            allAvailable = false;
          }
        } catch (error) {
          this.logger.error(`Failed to check availability for slot: ${error.message}`);
          unavailableInterviewers.push(interviewer.uid);
          allAvailable = false;
        }
      }

      // Add slot if all interviewers are available
      if (allAvailable) {
        alternatives.push({
          startTime: slot.start.toISOString(),
          endTime: slot.end.toISOString(),
          allAvailable: true,
        });
      }
    }

    return alternatives;
  }

  /**
   * Return all company interviews that fall within a date range.
   * Optionally filtered to specific organizers by memberUids.
   * Scoped to the requesting user's company. Max 500 results.
   */
  async getCalendar(dto: GetCalendarInterviewsDto, companyId: number | null): Promise<CalendarInterviewResponseDto[]> {
    const { startDate, endDate, memberUids } = dto;

    // Parse optional comma-separated organizer UIDs
    const organizerUidList: string[] | undefined =
      memberUids && memberUids.trim().length > 0
        ? memberUids
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    // Resolve organizer UIDs to internal IDs when a filter is requested
    let organizerIdList: number[] | undefined;
    if (organizerUidList && organizerUidList.length > 0) {
      const organizers = await this.databaseService.user.findMany({
        where: { uid: { in: organizerUidList } },
        select: { id: true },
      });
      organizerIdList = organizers.map((u) => u.id);
    }

    const interviews = await this.databaseService.interview.findMany({
      where: {
        deletedAt: null,
        scheduledDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        ...(organizerIdList !== undefined && { organizerId: { in: organizerIdList } }),
        // companyId null = SUPER_ADMIN, no company filter applied
        ...(companyId !== null && {
          stage: {
            hiringProcess: {
              companyId,
            },
          },
        }),
      },
      include: {
        organizer: true,
        stage: {
          include: {
            hiringProcess: {
              include: {
                candidate: {
                  select: { uid: true, name: true, email: true },
                },
                jobPosition: {
                  select: { uid: true, title: true },
                },
              },
            },
          },
        },
      },
      orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
      take: 500,
    });

    return interviews.map((interview) => {
      const hp = interview.stage.hiringProcess;
      return {
        uid: interview.uid,
        scheduledDate: interview.scheduledDate ? interview.scheduledDate.toISOString() : null,
        scheduledTime: interview.scheduledTime,
        duration: interview.duration,
        meetingLink: interview.meetingLink,
        status: interview.status,
        notes: interview.notes,
        candidate: hp?.candidate ? { uid: hp.candidate.uid, name: hp.candidate.name, email: hp.candidate.email ?? null } : { uid: '', name: 'Unknown', email: null },
        jobPosition: hp?.jobPosition ? { uid: hp.jobPosition.uid, title: hp.jobPosition.title } : { uid: '', title: 'Unknown' },
        stage: { uid: interview.stage.uid, title: interview.stage.title },
        organizer: interview.organizer ? { uid: interview.organizer.uid, name: interview.organizer.name, profilePicture: interview.organizer.profilePicture ?? null } : null,
      };
    });
  }

  /**
   * Add minutes to an ISO datetime string
   */
  private addMinutes(isoString: string, minutes: number): string {
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() + minutes);
    return date.toISOString();
  }
}
