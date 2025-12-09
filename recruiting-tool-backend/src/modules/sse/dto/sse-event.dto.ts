import { ApiProperty } from '@nestjs/swagger';

export enum SSEEventType {
  CANDIDATE_STATUS_CHANGED = 'CANDIDATE_STATUS_CHANGED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  NEW_APPLICATION = 'NEW_APPLICATION',
  SCORE_UPDATED = 'SCORE_UPDATED',
  NOTIFICATION = 'NOTIFICATION',
  HEARTBEAT = 'HEARTBEAT',
}

export class SSEEventDto<T = any> {
  @ApiProperty({
    description: 'Event type',
    enum: SSEEventType,
    example: SSEEventType.CANDIDATE_STATUS_CHANGED,
  })
  type: SSEEventType;

  @ApiProperty({
    description: 'Event payload data',
    example: {
      candidateUid: 'abc123',
      candidateName: 'John Doe',
      newStatus: 'Interview',
      jobPositionTitle: 'Software Engineer',
    },
  })
  payload: T;

  @ApiProperty({
    description: 'Event timestamp',
    example: '2025-11-25T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'User UID who should receive this event',
    example: 'user-abc-123',
  })
  userUid?: string;

  @ApiProperty({
    description: 'Company UID for multi-tenant filtering',
    example: 'company-xyz-789',
  })
  companyUid?: string;

  constructor(type: SSEEventType, payload: T, userUid?: string, companyUid?: string) {
    this.type = type;
    this.payload = payload;
    this.timestamp = new Date().toISOString();
    this.userUid = userUid;
    this.companyUid = companyUid;
  }
}

// Specific event payload interfaces
export interface CandidateStatusChangedPayload {
  candidateUid: string;
  candidateName: string;
  hiringProcessUid: string;
  previousStage?: string;
  newStage: string;
  jobPositionTitle: string;
  jobPositionUid: string;
}

export interface InterviewScheduledPayload {
  interviewUid: string;
  candidateUid: string;
  candidateName: string;
  interviewerName: string;
  scheduledAt: string;
  location: string;
  jobPositionTitle: string;
  hiringProcessUid: string;
}

export interface NewApplicationPayload {
  applicationUid: string;
  candidateName: string;
  candidateEmail: string;
  jobPositionUid: string;
  jobPositionTitle: string;
  appliedAt: string;
}

export interface ScoreUpdatedPayload {
  candidateUid: string;
  candidateName: string;
  hiringProcessUid: string;
  score: number;
  scoredBy: 'AI' | 'MANUAL';
  jobPositionTitle: string;
}

export interface NotificationPayload {
  notificationUid: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}
