import { Interview, User, Stage, InterviewInterviewer } from '@prisma/client';
import { InterviewResponseDto } from '../dto/interview.dto';

type InterviewWithRelations = Interview & {
  scheduledBy: User;
  stage: Stage;
  interviewers?: Array<InterviewInterviewer & { user: User }>;
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
    interviewers: interview.interviewers
      ? interview.interviewers.map(interviewer => ({
          userUid: interviewer.user.uid,
          userName: interviewer.user.name,
          role: interviewer.role,
        }))
      : [],
    createdAt: interview.createdAt,
    updatedAt: interview.updatedAt,
  };
};
