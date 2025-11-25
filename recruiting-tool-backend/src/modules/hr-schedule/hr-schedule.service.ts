import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CreateHRScheduleDto, UpdateHRScheduleDto, HRScheduleResponseDto } from './dto/hr-schedule.dto';

@Injectable()
export class HRScheduleService {
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * Get current user's schedule
   */
  async getMySchedule(userUid: string): Promise<HRScheduleResponseDto[]> {
    // Look up user to get numeric ID
    const user = await this.prisma.user.findUnique({
      where: { uid: userUid }
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    const schedules = await this.prisma.hRSchedule.findMany({
      where: { userId: user.id },
      include: {
        user: {
          select: { uid: true }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return schedules.map(schedule => this.toResponseDto(schedule));
  }

  /**
   * Get schedule by user UID (ADMIN only)
   */
  async getScheduleByUserUid(userUid: string): Promise<HRScheduleResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { uid: userUid }
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    const schedules = await this.prisma.hRSchedule.findMany({
      where: { userId: user.id },
      include: {
        user: {
          select: { uid: true }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return schedules.map(schedule => this.toResponseDto(schedule));
  }

  /**
   * Create availability slot
   */
  async createScheduleSlot(userUid: string, dto: CreateHRScheduleDto): Promise<HRScheduleResponseDto> {
    // Look up user to get numeric ID
    const user = await this.prisma.user.findUnique({
      where: { uid: userUid }
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    // Validate time range
    this.validateTimeRange(dto.startTime, dto.endTime);

    // Check for overlapping slots
    await this.checkOverlappingSlots(user.id, dto);

    const schedule = await this.prisma.hRSchedule.create({
      data: {
        userId: user.id,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        isRecurring: dto.isRecurring ?? true,
        specificDate: dto.specificDate ? new Date(dto.specificDate) : null
      },
      include: {
        user: {
          select: { uid: true }
        }
      }
    });

    return this.toResponseDto(schedule);
  }

  /**
   * Update schedule slot
   */
  async updateScheduleSlot(uid: string, userUid: string, dto: UpdateHRScheduleDto): Promise<HRScheduleResponseDto> {
    // Look up user to get numeric ID
    const user = await this.prisma.user.findUnique({
      where: { uid: userUid }
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    const schedule = await this.prisma.hRSchedule.findUnique({
      where: { uid },
      include: {
        user: {
          select: { id: true }
        }
      }
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with UID ${uid} not found`);
    }

    if (schedule.userId !== user.id) {
      throw new ForbiddenException('You can only update your own schedule');
    }

    // Validate time range if times are being updated
    if (dto.startTime || dto.endTime) {
      const startTime = dto.startTime || schedule.startTime;
      const endTime = dto.endTime || schedule.endTime;
      this.validateTimeRange(startTime, endTime);
    }

    const updatedSchedule = await this.prisma.hRSchedule.update({
      where: { uid },
      data: {
        ...(dto.dayOfWeek !== undefined && { dayOfWeek: dto.dayOfWeek }),
        ...(dto.startTime && { startTime: dto.startTime }),
        ...(dto.endTime && { endTime: dto.endTime }),
        ...(dto.isRecurring !== undefined && { isRecurring: dto.isRecurring }),
        ...(dto.specificDate && { specificDate: new Date(dto.specificDate) })
      },
      include: {
        user: {
          select: { uid: true }
        }
      }
    });

    return this.toResponseDto(updatedSchedule);
  }

  /**
   * Delete schedule slot
   */
  async deleteScheduleSlot(uid: string, userUid: string): Promise<void> {
    // Look up user to get numeric ID
    const user = await this.prisma.user.findUnique({
      where: { uid: userUid }
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    const schedule = await this.prisma.hRSchedule.findUnique({
      where: { uid }
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with UID ${uid} not found`);
    }

    if (schedule.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own schedule');
    }

    await this.prisma.hRSchedule.delete({
      where: { uid }
    });
  }

  /**
   * Get available time slots for a specific date
   */
  async getAvailableSlots(userUid: string, date: string): Promise<HRScheduleResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { uid: userUid }
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Get recurring schedules for this day OR specific date schedules
    const schedules = await this.prisma.hRSchedule.findMany({
      where: {
        userId: user.id,
        isAvailable: true,
        OR: [
          {
            isRecurring: true,
            dayOfWeek: dayOfWeek
          },
          {
            specificDate: {
              gte: new Date(targetDate.setHours(0, 0, 0, 0)),
              lt: new Date(targetDate.setHours(23, 59, 59, 999))
            }
          }
        ]
      },
      include: {
        user: {
          select: { uid: true }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    return schedules.map(schedule => this.toResponseDto(schedule));
  }

  /**
   * Validate time range
   */
  private validateTimeRange(startTime: string, endTime: string): void {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('Start time must be before end time');
    }
  }

  /**
   * Check for overlapping time slots
   */
  private async checkOverlappingSlots(userId: number, dto: CreateHRScheduleDto): Promise<void> {
    const existingSchedules = await this.prisma.hRSchedule.findMany({
      where: {
        userId,
        dayOfWeek: dto.dayOfWeek,
        ...(dto.specificDate && {
          specificDate: new Date(dto.specificDate)
        })
      }
    });

    for (const existing of existingSchedules) {
      if (this.timesOverlap(dto.startTime, dto.endTime, existing.startTime, existing.endTime)) {
        throw new BadRequestException(
          `Time slot overlaps with existing schedule: ${existing.startTime} - ${existing.endTime}`
        );
      }
    }
  }

  /**
   * Check if two time ranges overlap
   */
  private timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const [start1Hour, start1Minute] = start1.split(':').map(Number);
    const [end1Hour, end1Minute] = end1.split(':').map(Number);
    const [start2Hour, start2Minute] = start2.split(':').map(Number);
    const [end2Hour, end2Minute] = end2.split(':').map(Number);

    const start1Minutes = start1Hour * 60 + start1Minute;
    const end1Minutes = end1Hour * 60 + end1Minute;
    const start2Minutes = start2Hour * 60 + start2Minute;
    const end2Minutes = end2Hour * 60 + end2Minute;

    return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
  }

  /**
   * Convert to response DTO
   */
  private toResponseDto(schedule: any): HRScheduleResponseDto {
    return {
      uid: schedule.uid,
      userUid: schedule.user.uid,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isRecurring: schedule.isRecurring,
      specificDate: schedule.specificDate?.toISOString().split('T')[0],
      isAvailable: schedule.isAvailable,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt
    };
  }
}
