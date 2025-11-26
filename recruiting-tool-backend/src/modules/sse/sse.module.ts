import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SseController } from './sse.controller';
import { SseService } from './sse.service';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Use wildcards to allow dynamic event names
      wildcard: true,
      // Max listeners (default 10, increase for high-traffic apps)
      maxListeners: 100,
      // Enable verbose logging for debugging
      verboseMemoryLeak: true,
    }),
  ],
  controllers: [SseController],
  providers: [SseService],
  exports: [SseService], // Export SseService so other modules can emit events
})
export class SseModule {}
