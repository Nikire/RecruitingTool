import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { EmailService } from '../email/email.service';
import { RolesType } from '@prisma/client';
import { randomBytes } from 'crypto';
import { RequestDemoBookingDto, SelectDemoSlotDto, DemoBookingResponseDto, DemoTimeSlotResponseDto, DemoCalendarSettingsResponseDto } from './dto/demo-booking.dto';

@Injectable()
export class DemoBookingService {
  private readonly logger = new Logger(DemoBookingService.name);

  constructor(
    private readonly prisma: DatabaseService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Request a demo booking link for a prospect.
   * Finds the Borderless admin company, validates booking is enabled,
   * generates demo time slots, and returns a booking token.
   */
  async requestDemo(dto: RequestDemoBookingDto): Promise<DemoBookingResponseDto> {
    // Find the company with a SUPER_ADMIN user (the Borderless system company)
    const company = await this.prisma.company.findFirst({
      where: {
        users: {
          some: { roles: { has: RolesType.SUPER_ADMIN } },
        },
      },
      include: { calendarSettings: true },
    });

    if (!company) {
      throw new NotFoundException('System company not found');
    }

    const settings = company.calendarSettings;
    if (!settings?.isBookingEnabled) {
      throw new BadRequestException('Demo booking is currently not available. Please contact us via email.');
    }

    // Generate unique token
    const token = `demo_${randomBytes(16).toString('hex')}`;

    const advanceDays = settings.advanceBookingDays ?? 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + advanceDays + 7);

    // Generate demo slots
    const durationMinutes = 30; // Demo calls are 30 min
    const slots = this.generateDemoSlots(settings, durationMinutes);

    if (slots.length === 0) {
      throw new BadRequestException('No available demo slots at this time. Please contact us via email.');
    }

    // Create the booking token with associated slots
    const demoToken = await this.prisma.demoBookingToken.create({
      data: {
        token,
        prospectEmail: dto.email,
        prospectName: dto.name,
        prospectCompany: dto.company,
        expiresAt,
        companyId: company.id,
        slots: {
          create: slots.map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            isAvailable: true,
          })),
        },
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const bookingUrl = `${frontendUrl}/book-demo/${token}`;

    // Send booking link email to prospect
    try {
      await this.sendDemoBookingLinkEmail(dto.email, dto.name ?? dto.email, bookingUrl, expiresAt);
    } catch (err) {
      this.logger.error('Failed to send demo booking link email', err);
    }

    this.logger.log(`Demo booking token created for ${dto.email}, token: ${demoToken.token}`);

    return { token: demoToken.token, bookingUrl, expiresAt };
  }

  /**
   * Get available demo slots for a given token.
   */
  async getAvailableSlots(token: string): Promise<DemoTimeSlotResponseDto[]> {
    const demoToken = await this.validateToken(token);

    const slots = await this.prisma.demoTimeSlot.findMany({
      where: { tokenId: demoToken.id, isAvailable: true },
      orderBy: { startTime: 'asc' },
    });

    return slots.map((s) => ({
      uid: s.uid,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString(),
      isAvailable: s.isAvailable,
    }));
  }

  /**
   * Get calendar settings for the demo booking page.
   */
  async getSettings(token: string): Promise<DemoCalendarSettingsResponseDto> {
    const demoToken = await this.validateToken(token);

    const settings = await this.prisma.companyCalendarSettings.findUnique({
      where: { companyId: demoToken.companyId },
    });

    if (!settings) {
      // Return defaults if no settings configured
      return { workingDays: [1, 2, 3, 4, 5], advanceBookingDays: 30, blockedDates: [] };
    }

    const workingDays: number[] = Array.isArray(settings.workingDays) ? (settings.workingDays as number[]) : JSON.parse(settings.workingDays as string);
    const blockedDates: string[] = Array.isArray(settings.blockedDates) ? (settings.blockedDates as string[]) : JSON.parse(settings.blockedDates as string);

    return {
      workingDays,
      advanceBookingDays: settings.advanceBookingDays,
      blockedDates,
    };
  }

  /**
   * Confirm a demo slot selection.
   */
  async confirmSlot(token: string, dto: SelectDemoSlotDto): Promise<DemoTimeSlotResponseDto> {
    const demoToken = await this.validateToken(token);

    const slot = await this.prisma.demoTimeSlot.findFirst({
      where: { uid: dto.slotUid, tokenId: demoToken.id, isAvailable: true },
    });

    if (!slot) {
      throw new NotFoundException('Time slot not found or no longer available');
    }

    // Mark all slots for this token as unavailable, mark token as used
    await Promise.all([
      this.prisma.demoTimeSlot.updateMany({
        where: { tokenId: demoToken.id },
        data: { isAvailable: false },
      }),
      this.prisma.demoBookingToken.update({
        where: { id: demoToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Mark the selected slot with its selection time
    const updatedSlot = await this.prisma.demoTimeSlot.update({
      where: { id: slot.id },
      data: { selectedAt: new Date(), isAvailable: false },
    });

    const scheduledDate = slot.startTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const scheduledTime = this.formatTime(slot.startTime);
    const durationMinutes = Math.round((slot.endTime.getTime() - slot.startTime.getTime()) / 60000);

    // Send confirmation email (fire and forget)
    try {
      await this.emailService.sendBookingConfirmation(
        demoToken.prospectEmail,
        demoToken.prospectName ?? demoToken.prospectEmail,
        scheduledDate,
        scheduledTime,
        durationMinutes,
        'Borderless ATS Demo',
        undefined,
      );
    } catch (err) {
      this.logger.error('Failed to send demo booking confirmation email', err);
    }

    this.logger.log(`Demo slot confirmed for ${demoToken.prospectEmail} at ${slot.startTime.toISOString()}`);

    return {
      uid: updatedSlot.uid,
      startTime: updatedSlot.startTime.toISOString(),
      endTime: updatedSlot.endTime.toISOString(),
      isAvailable: updatedSlot.isAvailable,
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async validateToken(token: string) {
    const demoToken = await this.prisma.demoBookingToken.findUnique({
      where: { token },
    });

    if (!demoToken) {
      throw new NotFoundException('Invalid booking link');
    }

    if (demoToken.expiresAt < new Date()) {
      throw new BadRequestException('This booking link has expired');
    }

    if (demoToken.usedAt) {
      throw new BadRequestException('This booking link has already been used');
    }

    return demoToken;
  }

  private generateDemoSlots(
    settings: { workingDays: unknown; workingHoursStart: string; workingHoursEnd: string; blockedDates: unknown; advanceBookingDays: number | null; bufferMinutes: number | null },
    durationMinutes: number,
  ): Array<{ startTime: Date; endTime: Date }> {
    const now = new Date();
    const slots: Array<{ startTime: Date; endTime: Date }> = [];
    const workingDays: number[] = Array.isArray(settings.workingDays) ? (settings.workingDays as number[]) : JSON.parse(settings.workingDays as string);
    const blockedDates: string[] = Array.isArray(settings.blockedDates) ? (settings.blockedDates as string[]) : JSON.parse(settings.blockedDates as string);
    const advanceDays = settings.advanceBookingDays ?? 30;
    const bufferMinutes = settings.bufferMinutes ?? 15;

    for (let dayOffset = 0; dayOffset < advanceDays; dayOffset++) {
      const date = new Date(now);
      date.setDate(date.getDate() + dayOffset);
      const dayOfWeek = date.getDay();
      if (!workingDays.includes(dayOfWeek)) continue;
      const dateStr = date.toISOString().split('T')[0];
      if (blockedDates.includes(dateStr)) continue;

      const [startHour, startMin] = settings.workingHoursStart.split(':').map(Number);
      const [endHour, endMin] = settings.workingHoursEnd.split(':').map(Number);
      const dayStart = new Date(date);
      dayStart.setHours(startHour, startMin, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(endHour, endMin, 0, 0);

      const cursor = new Date(dayStart);
      while (true) {
        const slotEnd = new Date(cursor.getTime() + durationMinutes * 60000);
        if (slotEnd > dayEnd) break;
        if (cursor > now) {
          slots.push({ startTime: new Date(cursor), endTime: new Date(slotEnd) });
        }
        cursor.setTime(slotEnd.getTime() + bufferMinutes * 60000);
      }
    }

    return slots;
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  private async sendDemoBookingLinkEmail(email: string, name: string, bookingUrl: string, expiresAt: Date): Promise<void> {
    const expiryDateStr = expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const subject = 'Your Borderless Demo Booking Link';
    const text = `
Dear ${name},

Thank you for your interest in Borderless ATS!

Please use the link below to schedule your personalized demo:
${bookingUrl}

This link will expire on ${expiryDateStr}.

Best regards,
The Borderless Team
    `.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1976d2;">Book Your Borderless Demo</h2>
        <p>Dear ${name},</p>
        <p>Thank you for your interest in <strong>Borderless ATS</strong>!</p>
        <p>Please click the button below to choose a time for your personalized demo.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${bookingUrl}"
             style="background-color: #1976d2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
            Choose a Demo Time
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 12px; word-break: break-all;">${bookingUrl}</p>
        <p style="color: #999; font-size: 12px;">This link will expire on ${expiryDateStr}.</p>
        <br/>
        <p>Best regards,<br/>The Borderless Team</p>
      </div>
    `;

    // Use the existing sendEmail pattern from EmailService via sendBookingInvitation-like approach
    // We'll reuse sendBookingConfirmation approach but for the invitation step.
    // Since we need a direct send, we'll call sendBookingInvitation with a fake job title.
    await this.emailService.sendBookingInvitation(email, name, bookingUrl, expiresAt, 'Borderless ATS Demo');
  }
}
