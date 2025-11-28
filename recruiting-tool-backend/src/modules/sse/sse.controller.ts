import { Controller, Sse, Req, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Observable, fromEvent, map, startWith, merge } from 'rxjs';
import { Request } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SSEEventDto } from './dto/sse-event.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { RolesType } from '@prisma/client';
import { SseService } from './sse.service';
import { UserWithPasswordResponseDto } from '../users/dto/users.dto';

export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

@ApiTags('SSE - Server-Sent Events')
@Controller('sse')
export class SseController {
  private readonly logger = new Logger(SseController.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly sseService: SseService,
  ) {}

  @Sse('events')
  @Auth([RolesType.USER])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Subscribe to real-time events',
    description: 'Server-Sent Events endpoint for receiving real-time notifications. Requires authentication via Bearer token in Authorization header or token query parameter.',
  })
  @ApiResponse({
    status: 200,
    description: 'SSE stream established successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  events(@Req() request: Request & { currentUser?: UserWithPasswordResponseDto }): Observable<MessageEvent> {
    const user = request.currentUser;
    const userUid = user?.uid;
    const companyUid = user?.companyUid;

    this.logger.log(`SSE connection established for user: ${userUid}, company: ${companyUid}`);

    // Create observable from EventEmitter2 events
    const eventStream$ = fromEvent<SSEEventDto>(this.eventEmitter, 'sse.event').pipe(
      // Filter events for this specific user/company
      map((event: SSEEventDto) => {
        // Allow event if:
        // 1. No userUid/companyUid specified (broadcast to all)
        // 2. Event's userUid matches this user
        // 3. Event's companyUid matches this user's company
        const shouldReceive = !event.userUid && !event.companyUid ? true : event.userUid === userUid || event.companyUid === companyUid;

        if (shouldReceive) {
          this.logger.debug(`Sending event ${event.type} to user ${userUid}`);
          return {
            data: event,
            type: event.type,
          } as MessageEvent;
        }

        return null;
      }),
      // Filter out null events
      map((messageEvent) => {
        if (messageEvent === null) {
          // Return empty event that will be filtered out
          return undefined;
        }
        return messageEvent;
      }),
    );

    // Create heartbeat observable (every 30 seconds)
    const heartbeat$ = new Observable<MessageEvent>((subscriber) => {
      const interval = setInterval(() => {
        subscriber.next({
          data: {
            type: 'HEARTBEAT',
            timestamp: new Date().toISOString(),
          },
          type: 'HEARTBEAT',
        });
      }, 30000); // 30 seconds

      // Cleanup on unsubscribe
      return () => {
        clearInterval(interval);
        this.logger.log(`SSE connection closed for user: ${userUid}`);
      };
    });

    // Merge event stream with heartbeat
    return merge(
      eventStream$.pipe(
        // Filter out undefined events
        map((event) => {
          if (event === undefined) {
            return null;
          }
          return event;
        }),
      ),
      heartbeat$,
    ).pipe(
      // Filter out null events
      map((event) => {
        if (event === null) {
          return undefined;
        }
        return event;
      }),
      // Send initial connection success message
      startWith({
        data: {
          type: 'CONNECTION_ESTABLISHED',
          message: 'SSE connection established successfully',
          userUid,
          companyUid,
        },
        type: 'CONNECTION_ESTABLISHED',
      } as MessageEvent),
    );
  }
}
