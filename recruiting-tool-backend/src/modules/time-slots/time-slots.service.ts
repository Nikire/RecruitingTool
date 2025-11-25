import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import {
  GenerateTimeSlotsDto,
  GenerateCustomTimeSlotsDto,
  SelectTimeSlotDto,
  TimeSlotResponseDto,
  BookingTokenResponseDto,
} from './dto/time-slots.dto';
import { randomBytes } from 'crypto';
import { InterviewStatus } from '@prisma/client';

@Injectable()
export class TimeSlotsService {
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * Generate time slots based on HR schedule availability
   */
  async generateTimeSlots(dto: GenerateTimeSlotsDto): Promise<TimeSlotResponseDto[]> {
    // Find the interview
    const interview = await this.prisma.interview.findUnique({
      where: { uid: dto.interviewUid },
      include: { stage: true },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with UID ${dto.interviewUid} not found`);
    }

    // Find the HR schedule
    const hrSchedule = await this.prisma.hRSchedule.findUnique({
      where: { uid: dto.hrScheduleUid },
    });

    if (!hrSchedule) {
      throw new NotFoundException(`HR Schedule with UID ${dto.hrScheduleUid} not found`);
    }

    // Delete existing time slots for this interview
    await this.prisma.interviewTimeSlot.deleteMany({
      where: { interviewId: interview.id },
    });

    // Generate time slots based on HR schedule
    const slots = this.generateSlotsFromSchedule(
      hrSchedule,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.duration,
    );

    // Create time slots in database
    const createdSlots = await Promise.all(
      slots.map((slot) =>
        this.prisma.interviewTimeSlot.create({
          data: {
            interviewId: interview.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: true,
          },
        }),
      ),
    );

    return createdSlots.map(this.mapToTimeSlotResponse);
  }

  /**
   * Generate custom time slots manually specified by HR
   */
  async generateCustomTimeSlots(dto: GenerateCustomTimeSlotsDto): Promise<TimeSlotResponseDto[]> {
    // Find the interview
    const interview = await this.prisma.interview.findUnique({
      where: { uid: dto.interviewUid },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with UID ${dto.interviewUid} not found`);
    }

    // Delete existing time slots for this interview
    await this.prisma.interviewTimeSlot.deleteMany({
      where: { interviewId: interview.id },
    });

    // Create custom time slots
    const createdSlots = await Promise.all(
      dto.slots.map((slot) =>
        this.prisma.interviewTimeSlot.create({
          data: {
            interviewId: interview.id,
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime),
            isAvailable: true,
          },
        }),
      ),
    );

    return createdSlots.map(this.mapToTimeSlotResponse);
  }

  /**
   * Get available time slots for a booking token (public endpoint)
   */
  async getAvailableSlots(token: string): Promise<TimeSlotResponseDto[]> {
    // Find and validate the booking token
    const bookingToken = await this.prisma.interviewBookingToken.findUnique({
      where: { token },
      include: {
        interview: {
          include: { timeSlots: true },
        },
      },
    });

    if (!bookingToken) {
      throw new NotFoundException('Invalid booking token');
    }

    // Check if token is expired
    if (new Date() > bookingToken.expiresAt) {
      throw new ForbiddenException('Booking token has expired');
    }

    // Check if token was already used
    if (bookingToken.usedAt) {
      throw new ForbiddenException('Booking token has already been used');
    }

    // Filter available slots
    const availableSlots = bookingToken.interview.timeSlots
      .filter((slot) => slot.isAvailable && new Date(slot.startTime) > new Date())
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return availableSlots.map(this.mapToTimeSlotResponse);
  }

  /**
   * Select a time slot (public endpoint)
   */
  async selectSlot(token: string, dto: SelectTimeSlotDto): Promise<TimeSlotResponseDto> {
    // Find and validate the booking token
    const bookingToken = await this.prisma.interviewBookingToken.findUnique({
      where: { token },
      include: {
        interview: {
          include: { timeSlots: true },
        },
      },
    });

    if (!bookingToken) {
      throw new NotFoundException('Invalid booking token');
    }

    // Check if token is expired
    if (new Date() > bookingToken.expiresAt) {
      throw new ForbiddenException('Booking token has expired');
    }

    // Check if token was already used
    if (bookingToken.usedAt) {
      throw new ForbiddenException('Booking token has already been used');
    }

    // Find the time slot
    const slot = await this.prisma.interviewTimeSlot.findUnique({
      where: { uid: dto.slotUid },
    });

    if (!slot) {
      throw new NotFoundException(`Time slot with UID ${dto.slotUid} not found`);
    }

    // Verify slot belongs to the interview
    if (slot.interviewId !== bookingToken.interview.id) {
      throw new BadRequestException('Time slot does not belong to this interview');
    }

    // Check if slot is still available
    if (!slot.isAvailable) {
      throw new BadRequestException('Time slot is no longer available');
    }

    // Check if slot is in the future
    if (new Date(slot.startTime) <= new Date()) {
      throw new BadRequestException('Cannot select a past time slot');
    }

    // Mark all other slots as unavailable and mark this one as selected
    await this.prisma.$transaction([
      // Mark all slots for this interview as unavailable
      this.prisma.interviewTimeSlot.updateMany({
        where: { interviewId: bookingToken.interview.id },
        data: { isAvailable: false },
      }),
      // Mark the selected slot
      this.prisma.interviewTimeSlot.update({
        where: { id: slot.id },
        data: {
          selectedAt: new Date(),
          isAvailable: false,
        },
      }),
      // Update interview with scheduled time
      this.prisma.interview.update({
        where: { id: bookingToken.interview.id },
        data: {
          scheduledDate: slot.startTime,
          scheduledTime: this.formatTime(slot.startTime),
          duration: Math.round((slot.endTime.getTime() - slot.startTime.getTime()) / 60000),
          status: InterviewStatus.SCHEDULED,
        },
      }),
      // Mark token as used
      this.prisma.interviewBookingToken.update({
        where: { id: bookingToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Fetch updated slot
    const updatedSlot = await this.prisma.interviewTimeSlot.findUnique({
      where: { uid: dto.slotUid },
    });

    return this.mapToTimeSlotResponse(updatedSlot!);
  }

  /**
   * Cancel a selected time slot and re-open all slots
   */
  async cancelSlotSelection(interviewUid: string): Promise<void> {
    const interview = await this.prisma.interview.findUnique({
      where: { uid: interviewUid },
      include: { timeSlots: true },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with UID ${interviewUid} not found`);
    }

    // Re-open all future slots
    await this.prisma.interviewTimeSlot.updateMany({
      where: {
        interviewId: interview.id,
        startTime: { gt: new Date() },
      },
      data: {
        isAvailable: true,
        selectedAt: null,
      },
    });

    // Clear interview schedule
    await this.prisma.interview.update({
      where: { id: interview.id },
      data: {
        scheduledDate: null,
        scheduledTime: null,
        duration: null,
        status: InterviewStatus.PENDING,
      },
    });
  }

  /**
   * Generate a booking token for an interview
   */
  async generateBookingToken(interviewUid: string, expiresInDays = 7): Promise<BookingTokenResponseDto> {
    const interview = await this.prisma.interview.findUnique({
      where: { uid: interviewUid },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with UID ${interviewUid} not found`);
    }

    // Generate unique token
    const token = `bk_${randomBytes(16).toString('hex')}`;

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create booking token
    const bookingToken = await this.prisma.interviewBookingToken.create({
      data: {
        token,
        interviewId: interview.id,
        expiresAt,
      },
    });

    return this.mapToBookingTokenResponse(bookingToken);
  }

  /**
   * Get all time slots for an interview (HR endpoint)
   */
  async getTimeSlotsByInterview(interviewUid: string): Promise<TimeSlotResponseDto[]> {
    const interview = await this.prisma.interview.findUnique({
      where: { uid: interviewUid },
      include: {
        timeSlots: {
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with UID ${interviewUid} not found`);
    }

    return interview.timeSlots.map(this.mapToTimeSlotResponse);
  }

  /**
   * Helper: Generate slots from HR schedule
   */
  private generateSlotsFromSchedule(
    hrSchedule: any,
    startDate: Date,
    endDate: Date,
    slotDuration: number,
  ): Array<{ startTime: Date; endTime: Date }> {
    const slots: Array<{ startTime: Date; endTime: Date }> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Check if this day matches the HR schedule
      const dayOfWeek = currentDate.getDay();

      if (hrSchedule.dayOfWeek === dayOfWeek && hrSchedule.isAvailable) {
        // Parse schedule times (format: "HH:mm")
        const [startHour, startMin] = hrSchedule.startTime.split(':').map(Number);
        const [endHour, endMin] = hrSchedule.endTime.split(':').map(Number);

        const dayStart = new Date(currentDate);
        dayStart.setHours(startHour, startMin, 0, 0);

        const dayEnd = new Date(currentDate);
        dayEnd.setHours(endHour, endMin, 0, 0);

        // Generate slots for this day
        let slotStart = new Date(dayStart);
        while (slotStart.getTime() + slotDuration * 60000 <= dayEnd.getTime()) {
          const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
          slots.push({
            startTime: new Date(slotStart),
            endTime: new Date(slotEnd),
          });
          slotStart = new Date(slotEnd);
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  /**
   * Helper: Format time as HH:mm
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Mapper: Time slot to response DTO
   */
  private mapToTimeSlotResponse(slot: any): TimeSlotResponseDto {
    return {
      uid: slot.uid,
      interviewUid: slot.interview?.uid || '',
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
      selectedAt: slot.selectedAt,
      createdAt: slot.createdAt,
    };
  }

  /**
   * Mapper: Booking token to response DTO
   */
  private mapToBookingTokenResponse(token: any): BookingTokenResponseDto {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return {
      uid: token.uid,
      token: token.token,
      interviewUid: token.interview?.uid || '',
      expiresAt: token.expiresAt,
      usedAt: token.usedAt,
      createdAt: token.createdAt,
      bookingUrl: `${frontendUrl}/book-interview/${token.token}`,
    };
  }
}
