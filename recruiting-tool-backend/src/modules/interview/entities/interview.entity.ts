import { Interview, User, Stage, InterviewInterviewer, InterviewReschedule } from '@prisma/client';
import { InterviewResponseDto, InterviewRescheduleHistoryDto } from '../dto/interview.dto';

type InterviewWithRelations = Interview & {
  scheduledBy: User;
  stage: Stage;
  interviewers?: Array<InterviewInterviewer & { user: User }>;
  organizer?: User | null;
};

type InterviewRescheduleWithRelations = InterviewReschedule & {
  rescheduledBy: User;
};

export const InterviewMapper = (interview: InterviewWithRelations): InterviewResponseDto => {
  return {
    uid: interview.uid,
    stageUid: interview.stage.uid,
    scheduledDate: interview.scheduledDate ? interview.scheduledDate.toISOString() : null,
    scheduledTime: interview.scheduledTime,
    duration: interview.duration,
    status: interview.status,
    meetingLink: interview.meetingLink,
    location: interview.location,
    notes: interview.notes,
    scheduledByUid: interview.scheduledBy.uid,
    scheduledByName: interview.scheduledBy.name,
    organizer: interview.organizer
      ? {
          uid: interview.organizer.uid,
          name: interview.organizer.name,
          profilePicture: interview.organizer.profilePicture ?? null,
        }
      : null,
    interviewers: interview.interviewers
      ? interview.interviewers.map((interviewer) => ({
          userUid: interviewer.user.uid,
          userName: interviewer.user.name,
          role: interviewer.role,
        }))
      : [],
    rescheduledCount: interview.rescheduledCount,
    originalScheduledDate: interview.originalScheduledDate ? interview.originalScheduledDate.toISOString() : null,
    lastRescheduledAt: interview.lastRescheduledAt ? interview.lastRescheduledAt.toISOString() : null,
    rescheduledReason: interview.rescheduledReason,
    createdAt: interview.createdAt,
    updatedAt: interview.updatedAt,
  };
};

export const InterviewRescheduleMapper = (reschedule: InterviewRescheduleWithRelations): InterviewRescheduleHistoryDto => {
  return {
    uid: reschedule.uid,
    oldScheduledDate: reschedule.oldScheduledDate,
    oldScheduledTime: reschedule.oldScheduledTime,
    newScheduledDate: reschedule.newScheduledDate,
    newScheduledTime: reschedule.newScheduledTime,
    reason: reschedule.reason,
    rescheduledByUid: reschedule.rescheduledBy.uid,
    rescheduledByName: reschedule.rescheduledBy.name,
    rescheduledAt: reschedule.rescheduledAt,
  };
};
