import { Interview, User, Stage } from '@prisma/client';
import { InterviewResponseDto } from '../dto/interview.dto';

type InterviewWithRelations = Interview & {
  scheduledBy: User;
  stage: Stage;
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
    notes: interview.notes,
    scheduledByUid: interview.scheduledBy.uid,
    scheduledByName: interview.scheduledBy.name,
    createdAt: interview.createdAt,
    updatedAt: interview.updatedAt,
  };
};
