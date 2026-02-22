import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { CreateContactMessageDto, ContactMessageResponseDto } from './dto';

@Injectable()
export class ContactMessagesService {
  private readonly logger = new Logger(ContactMessagesService.name);

  constructor(
    private databaseService: DatabaseService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Create a new contact message and send notification email to admin
   */
  async create(dto: CreateContactMessageDto): Promise<ContactMessageResponseDto> {
    this.logger.log(`Creating contact message from ${dto.email}`);

    const contactMessage = await this.databaseService.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        company: dto.company,
        message: dto.message,
      },
    });

    // Send notification email to admin (async, don't wait)
    this.sendAdminNotification(contactMessage).catch((error) => {
      this.logger.error(`Failed to send admin notification for contact message: ${error.message}`);
    });

    return this.mapToResponseDto(contactMessage);
  }

  /**
   * Get all contact messages (admin only) with optional pagination
   */
  async findAll(page: number = 1, limit: number = 20): Promise<{ data: ContactMessageResponseDto[]; total: number }> {
    this.logger.log(`Fetching contact messages - page ${page}, limit ${limit}`);

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.databaseService.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.databaseService.contactMessage.count(),
    ]);

    return {
      data: messages.map(this.mapToResponseDto),
      total,
    };
  }

  /**
   * Mark a contact message as read
   */
  async markAsRead(uid: string): Promise<ContactMessageResponseDto> {
    this.logger.log(`Marking contact message ${uid} as read`);

    const existing = await this.databaseService.contactMessage.findUnique({
      where: { uid },
    });

    if (!existing) {
      throw new NotFoundException(`Contact message with UID ${uid} not found`);
    }

    const updated = await this.databaseService.contactMessage.update({
      where: { uid },
      data: { isRead: true },
    });

    return this.mapToResponseDto(updated);
  }

  /**
   * Send notification email to admin when a new contact message arrives
   */
  private async sendAdminNotification(contactMessage: any): Promise<void> {
    const smtpEnabled = this.configService.get<string>('SMTP_ENABLED', 'false') === 'true';

    if (!smtpEnabled) {
      this.logger.log('SMTP disabled - skipping admin notification for contact message');
      return;
    }

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not configured - skipping contact message notification');
      return;
    }

    const subject = `New Contact Message from ${contactMessage.name}`;

    const text = `
New Contact Message

From: ${contactMessage.name}
Email: ${contactMessage.email}
${contactMessage.company ? `Company: ${contactMessage.company}` : ''}

Message:
${contactMessage.message}

Submitted: ${new Date(contactMessage.createdAt).toLocaleString()}
    `.trim();

    const html = `
      <h2>New Contact Message</h2>
      <p><strong>From:</strong> ${contactMessage.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${contactMessage.email}">${contactMessage.email}</a></p>
      ${contactMessage.company ? `<p><strong>Company:</strong> ${contactMessage.company}</p>` : ''}
      <hr/>
      <h3>Message:</h3>
      <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${contactMessage.message}</p>
      <hr/>
      <p style="color: #666; font-size: 12px;">Submitted: ${new Date(contactMessage.createdAt).toLocaleString()}</p>
      <p style="color: #666; font-size: 12px;">UID: ${contactMessage.uid}</p>
    `;

    try {
      await this.emailService['sendEmail'](adminEmail, subject, text, html, 'CONTACT_MESSAGE', contactMessage.uid);
      this.logger.log(`Contact message notification sent to admin at ${adminEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send contact message notification: ${error.message}`);
    }
  }

  /**
   * Map Prisma ContactMessage to response DTO
   */
  private mapToResponseDto(message: any): ContactMessageResponseDto {
    return {
      uid: message.uid,
      name: message.name,
      email: message.email,
      company: message.company ?? undefined,
      message: message.message,
      isRead: message.isRead,
      createdAt: message.createdAt,
    };
  }
}
