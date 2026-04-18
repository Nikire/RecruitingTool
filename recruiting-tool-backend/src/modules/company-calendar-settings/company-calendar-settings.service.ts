import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CompanyCalendarSettingsResponseDto, UpdateCompanyCalendarSettingsDto } from './dto/company-calendar-settings.dto';

@Injectable()
export class CompanyCalendarSettingsService {
  constructor(private readonly prisma: DatabaseService) {}

  async getSettings(companyId: number): Promise<CompanyCalendarSettingsResponseDto> {
    const settings = await this.prisma.companyCalendarSettings.upsert({
      where: { companyId },
      create: { companyId },
      update: {},
    });

    return this.mapToDto(settings);
  }

  async updateSettings(companyId: number, dto: UpdateCompanyCalendarSettingsDto): Promise<CompanyCalendarSettingsResponseDto> {
    const data: Record<string, unknown> = {};

    if (dto.isBookingEnabled !== undefined) data.isBookingEnabled = dto.isBookingEnabled;
    if (dto.workingDays !== undefined) data.workingDays = dto.workingDays;
    if (dto.workingHoursStart !== undefined) data.workingHoursStart = dto.workingHoursStart;
    if (dto.workingHoursEnd !== undefined) data.workingHoursEnd = dto.workingHoursEnd;
    if (dto.bufferMinutes !== undefined) data.bufferMinutes = dto.bufferMinutes;
    if (dto.blockedDates !== undefined) data.blockedDates = dto.blockedDates;
    if (dto.advanceBookingDays !== undefined) data.advanceBookingDays = dto.advanceBookingDays;

    const settings = await this.prisma.companyCalendarSettings.upsert({
      where: { companyId },
      create: { companyId, ...data },
      update: data,
    });

    return this.mapToDto(settings);
  }

  private mapToDto(settings: {
    uid: string;
    isBookingEnabled: boolean;
    workingDays: unknown;
    workingHoursStart: string;
    workingHoursEnd: string;
    bufferMinutes: number;
    blockedDates: unknown;
    advanceBookingDays: number;
  }): CompanyCalendarSettingsResponseDto {
    return {
      uid: settings.uid,
      isBookingEnabled: settings.isBookingEnabled,
      workingDays: settings.workingDays as number[],
      workingHoursStart: settings.workingHoursStart,
      workingHoursEnd: settings.workingHoursEnd,
      bufferMinutes: settings.bufferMinutes,
      blockedDates: settings.blockedDates as string[],
      advanceBookingDays: settings.advanceBookingDays,
    };
  }
}
