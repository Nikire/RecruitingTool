import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SSEEventDto, SSEEventType } from './dto/sse-event.dto';

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Emit a Server-Sent Event to all connected clients
   * @param event SSE event to emit
   */
  emitEvent(event: SSEEventDto): void {
    this.logger.log(`Emitting SSE event: ${event.type} for user: ${event.userUid || 'all'}`);

    // Emit the event to EventEmitter2, which will be picked up by the SSE controller
    this.eventEmitter.emit('sse.event', event);
  }

  /**
   * Emit candidate status changed event
   */
  emitCandidateStatusChanged(
    candidateUid: string,
    candidateName: string,
    hiringProcessUid: string,
    previousStage: string | undefined,
    newStage: string,
    jobPositionTitle: string,
    jobPositionUid: string,
    userUid?: string,
    companyUid?: string,
  ): void {
    const event = new SSEEventDto(
      SSEEventType.CANDIDATE_STATUS_CHANGED,
      {
        candidateUid,
        candidateName,
        hiringProcessUid,
        previousStage,
        newStage,
        jobPositionTitle,
        jobPositionUid,
      },
      userUid,
      companyUid,
    );

    this.emitEvent(event);
  }

  /**
   * Emit interview scheduled event
   */
  emitInterviewScheduled(
    interviewUid: string,
    candidateUid: string,
    candidateName: string,
    interviewerName: string,
    scheduledAt: string,
    location: string,
    jobPositionTitle: string,
    hiringProcessUid: string,
    userUid?: string,
    companyUid?: string,
  ): void {
    const event = new SSEEventDto(
      SSEEventType.INTERVIEW_SCHEDULED,
      {
        interviewUid,
        candidateUid,
        candidateName,
        interviewerName,
        scheduledAt,
        location,
        jobPositionTitle,
        hiringProcessUid,
      },
      userUid,
      companyUid,
    );

    this.emitEvent(event);
  }

  /**
   * Emit new application event
   */
  emitNewApplication(
    applicationUid: string,
    candidateName: string,
    candidateEmail: string,
    jobPositionUid: string,
    jobPositionTitle: string,
    appliedAt: string,
    userUid?: string,
    companyUid?: string,
  ): void {
    const event = new SSEEventDto(
      SSEEventType.NEW_APPLICATION,
      {
        applicationUid,
        candidateName,
        candidateEmail,
        jobPositionUid,
        jobPositionTitle,
        appliedAt,
      },
      userUid,
      companyUid,
    );

    this.emitEvent(event);
  }

  /**
   * Emit score updated event
   */
  emitScoreUpdated(
    candidateUid: string,
    candidateName: string,
    hiringProcessUid: string,
    score: number,
    scoredBy: 'AI' | 'MANUAL',
    jobPositionTitle: string,
    userUid?: string,
    companyUid?: string,
  ): void {
    const event = new SSEEventDto(
      SSEEventType.SCORE_UPDATED,
      {
        candidateUid,
        candidateName,
        hiringProcessUid,
        score,
        scoredBy,
        jobPositionTitle,
      },
      userUid,
      companyUid,
    );

    this.emitEvent(event);
  }

  /**
   * Emit notification event
   */
  emitNotification(
    notificationUid: string,
    type: string,
    title: string,
    message: string,
    metadata: Record<string, any> | undefined,
    userUid: string,
    companyUid?: string,
  ): void {
    const event = new SSEEventDto(
      SSEEventType.NOTIFICATION,
      {
        notificationUid,
        type,
        title,
        message,
        metadata,
      },
      userUid,
      companyUid,
    );

    this.emitEvent(event);
  }

  /**
   * Emit heartbeat event to keep connection alive
   */
  emitHeartbeat(): void {
    const event = new SSEEventDto(SSEEventType.HEARTBEAT, { timestamp: new Date().toISOString() });
    this.emitEvent(event);
  }
}
