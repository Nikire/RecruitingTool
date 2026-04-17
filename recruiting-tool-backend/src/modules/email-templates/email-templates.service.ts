import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto, EmailTemplateResponseDto } from './dto/email-template.dto';
import { EmailTemplateMapper } from './entities/email-template.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { CacheService } from '../cache/cache.service';
import * as Handlebars from 'handlebars';
import { EmailTemplateType } from '@prisma/client';

@Injectable()
export class EmailTemplatesService {
  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
  ) {}

  async create(createDto: CreateEmailTemplateDto, userId: number): Promise<EmailTemplateResponseDto> {
    let companyId: number | null = null;

    // Find company by UID if provided
    if (createDto.companyUid) {
      const company = await this.databaseService.company.findUnique({
        where: { uid: createDto.companyUid },
      });

      if (!company) {
        throw new NotFoundException(`Company ${createDto.companyUid} not found`);
      }

      companyId = company.id;
    }

    // Verify user exists
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // If setting as default and has a type, unset any existing default of same type
    if (createDto.isDefault && createDto.type) {
      await this.unsetExistingDefaultForType(companyId, createDto.type);
    }

    const emailTemplate = await this.databaseService.emailTemplate.create({
      data: {
        name: createDto.name,
        subject: createDto.subject,
        body: createDto.body,
        type: createDto.type,
        companyId: companyId,
        createdById: userId,
        isDefault: createDto.isDefault || false,
      },
      include: {
        company: true,
        createdBy: true,
      },
    });

    // Invalidate email templates cache after creation
    await this.cacheService.invalidate('email-templates');

    return EmailTemplateMapper(emailTemplate);
  }

  async findAll(companyUid?: string): Promise<EmailTemplateResponseDto[]> {
    let companyId: number | undefined;

    // If companyUid is provided, filter by company
    if (companyUid) {
      const company = await this.databaseService.company.findUnique({
        where: { uid: companyUid },
      });

      if (!company) {
        throw new NotFoundException(`Company ${companyUid} not found`);
      }

      companyId = company.id;
    }

    const emailTemplates = await this.databaseService.emailTemplate.findMany({
      where: companyId ? { companyId } : {},
      include: {
        company: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return emailTemplates.map((template) => EmailTemplateMapper(template));
  }

  async findOne(uid: string): Promise<EmailTemplateResponseDto> {
    const emailTemplate = await this.databaseService.emailTemplate.findUnique({
      where: { uid },
      include: {
        company: true,
        createdBy: true,
      },
    });

    if (!emailTemplate) {
      throw new NotFoundException(`Email template ${uid} not found`);
    }

    return EmailTemplateMapper(emailTemplate);
  }

  async update(uid: string, updateDto: UpdateEmailTemplateDto): Promise<EmailTemplateResponseDto> {
    // Check if template exists
    const existingTemplate = await this.databaseService.emailTemplate.findUnique({
      where: { uid },
    });

    if (!existingTemplate) {
      throw new NotFoundException(`Email template ${uid} not found`);
    }

    // Determine the type (use new type if provided, otherwise keep existing)
    const effectiveType = updateDto.type ?? existingTemplate.type;

    // If setting as default and has a type, unset any existing default of same type
    if (updateDto.isDefault && effectiveType) {
      await this.unsetExistingDefaultForType(existingTemplate.companyId, effectiveType);
    }

    const emailTemplate = await this.databaseService.emailTemplate.update({
      where: { uid },
      data: {
        name: updateDto.name,
        subject: updateDto.subject,
        body: updateDto.body,
        type: updateDto.type,
        isDefault: updateDto.isDefault,
      },
      include: {
        company: true,
        createdBy: true,
      },
    });

    // Invalidate cache for this specific template and all templates
    await this.cacheService.invalidate(`email-templates:${uid}`);
    await this.cacheService.invalidate('email-templates');

    return EmailTemplateMapper(emailTemplate);
  }

  async remove(uid: string): Promise<MessageResponseDto> {
    // Check if template exists
    const existingTemplate = await this.databaseService.emailTemplate.findUnique({
      where: { uid },
    });

    if (!existingTemplate) {
      throw new NotFoundException(`Email template ${uid} not found`);
    }

    await this.databaseService.emailTemplate.delete({
      where: { uid },
    });

    // Invalidate cache after deletion
    await this.cacheService.invalidate('email-templates');

    return { message: 'Email template deleted successfully' };
  }

  /**
   * Unset existing default template for a specific type within a company
   * Ensures only one template can be default per type per company
   */
  private async unsetExistingDefaultForType(companyId: number | null, type: string): Promise<void> {
    await this.databaseService.emailTemplate.updateMany({
      where: {
        companyId: companyId,
        type: type as any,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  /**
   * Render a template with provided variables
   * Supports Handlebars syntax: {{variableName}}
   */
  renderTemplate(templateBody: string, variables: Record<string, any>): string {
    try {
      const template = Handlebars.compile(templateBody);
      return template(variables);
    } catch (error) {
      throw new BadRequestException(`Failed to render template: ${error.message}`);
    }
  }

  /**
   * Preview a template with sample data
   */
  async preview(uid: string, variables?: Record<string, any>): Promise<{ renderedSubject: string; renderedBody: string }> {
    const emailTemplate = await this.findOne(uid);

    // Default sample data if not provided
    const sampleData = variables || {
      candidateName: 'John Doe',
      positionTitle: 'Senior Software Engineer',
      companyName: 'Tech Corp',
      hrName: 'Jane Smith',
      interviewDate: new Date().toLocaleDateString(),
      interviewTime: '10:00 AM',
    };

    const renderedSubject = this.renderTemplate(emailTemplate.subject, sampleData);
    const renderedBody = this.renderTemplate(emailTemplate.body, sampleData);

    return {
      renderedSubject,
      renderedBody,
    };
  }

  /**
   * Find email template by type for a specific company
   * Used for automated email selection
   */
  async findByType(companyUid: string, type: string): Promise<EmailTemplateResponseDto | null> {
    const company = await this.databaseService.company.findUnique({
      where: { uid: companyUid },
    });

    if (!company) {
      throw new NotFoundException(`Company ${companyUid} not found`);
    }

    const emailTemplate = await this.databaseService.emailTemplate.findFirst({
      where: {
        companyId: company.id,
        type: type as any, // Type conversion for enum
      },
      include: {
        company: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc', // Get most recent template of this type
      },
    });

    if (!emailTemplate) {
      return null;
    }

    return EmailTemplateMapper(emailTemplate);
  }

  /**
   * Public endpoint handler: create default templates for the authenticated user's company.
   */
  async createDefaults(companyId: number | null, userId: number): Promise<MessageResponseDto> {
    if (!companyId) {
      throw new BadRequestException('User does not belong to a company');
    }
    await this.createDefaultTemplatesForCompany(companyId, userId);
    return { message: 'Default email templates created successfully' };
  }

  /**
   * Create default email templates for a company.
   * Skips templates whose name+companyId already exist (idempotent).
   * @param companyId  Internal numeric company ID
   * @param createdById  Internal numeric user ID of the creator
   */
  async createDefaultTemplatesForCompany(companyId: number, createdById: number): Promise<void> {
    const defaults: Array<{ type: EmailTemplateType; name: string; subject: string; body: string }> = [
      {
        type: EmailTemplateType.APPLICATION_RECEIVED,
        name: 'Application Received',
        subject: 'We received your application for {{jobTitle}}',
        body: `<p>Dear {{candidateName}},</p>
<p>Thank you for applying for the <strong>{{jobTitle}}</strong> position at {{companyName}}. We have received your application and our team will review it shortly.</p>
<p>We will be in touch with you soon.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.APPLICATION_UNDER_REVIEW,
        name: 'Application Under Review',
        subject: 'Your application for {{jobTitle}} is under review',
        body: `<p>Dear {{candidateName}},</p>
<p>We wanted to let you know that your application for the <strong>{{jobTitle}}</strong> position is currently being reviewed by our hiring team.</p>
<p>We appreciate your patience and will update you as soon as we have news.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.APPLICATION_REJECTED,
        name: 'Application Not Selected',
        subject: 'Update on your application for {{jobTitle}}',
        body: `<p>Dear {{candidateName}},</p>
<p>Thank you for your interest in the <strong>{{jobTitle}}</strong> position at {{companyName}} and for the time you invested in the application process.</p>
<p>After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs. We encourage you to apply for future openings that align with your background.</p>
<p>We wish you the best in your job search.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.APPLICATION_SHORTLISTED,
        name: 'Application Shortlisted',
        subject: 'Congratulations! You have been shortlisted for {{jobTitle}}',
        body: `<p>Dear {{candidateName}},</p>
<p>We are pleased to inform you that your application for the <strong>{{jobTitle}}</strong> position has been shortlisted. You are among the top candidates we are considering.</p>
<p>Our team will be in contact with you shortly to discuss the next steps.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.INTERVIEW_INVITATION,
        name: 'Interview Invitation',
        subject: 'Interview Invitation for {{jobTitle}} at {{companyName}}',
        body: `<p>Dear {{candidateName}},</p>
<p>We would like to invite you for an interview for the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>
<p><strong>Date:</strong> {{interviewDate}}<br/><strong>Time:</strong> {{interviewTime}}</p>
<p>Please confirm your availability by replying to this email. If you have any questions, do not hesitate to reach out.</p>
<p>We look forward to meeting you.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.INTERVIEW_REMINDER,
        name: 'Interview Reminder',
        subject: 'Reminder: Your interview for {{jobTitle}} is coming up',
        body: `<p>Dear {{candidateName}},</p>
<p>This is a friendly reminder that your interview for the <strong>{{jobTitle}}</strong> position at {{companyName}} is scheduled for:</p>
<p><strong>Date:</strong> {{interviewDate}}<br/><strong>Time:</strong> {{interviewTime}}</p>
<p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.OFFER_LETTER,
        name: 'Offer Letter',
        subject: 'Job Offer: {{jobTitle}} at {{companyName}}',
        body: `<p>Dear {{candidateName}},</p>
<p>We are delighted to offer you the position of <strong>{{jobTitle}}</strong> at {{companyName}}. We were impressed by your skills and experience, and we believe you will be a valuable addition to our team.</p>
<p>Please review the attached offer details and let us know if you have any questions. We look forward to welcoming you to the team.</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
      {
        type: EmailTemplateType.CUSTOM,
        name: 'Custom Template',
        subject: '{{subject}}',
        body: `<p>Dear {{candidateName}},</p>
<p>{{message}}</p>
<p>Best regards,<br/>{{hrName}}<br/>{{companyName}}</p>`,
      },
    ];

    await this.databaseService.emailTemplate.createMany({
      data: defaults.map((template) => ({
        name: template.name,
        subject: template.subject,
        body: template.body,
        type: template.type,
        companyId,
        createdById,
        isDefault: true,
      })),
      skipDuplicates: true,
    });

    // Invalidate email templates cache after bulk creation
    await this.cacheService.invalidate('email-templates');
  }

  /**
   * Find email template by type for a specific company (using internal company ID)
   * Returns null instead of throwing when no template is found.
   * Used internally for automated status-change email selection.
   */
  async findByTypeAndCompany(type: string, companyId: number): Promise<EmailTemplateResponseDto | null> {
    const emailTemplate = await this.databaseService.emailTemplate.findFirst({
      where: {
        companyId,
        type: type as any,
        isDefault: true,
      },
      include: {
        company: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!emailTemplate) {
      // Fall back to any template of this type (not just default)
      const fallback = await this.databaseService.emailTemplate.findFirst({
        where: {
          companyId,
          type: type as any,
        },
        include: {
          company: true,
          createdBy: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!fallback) {
        return null;
      }

      return EmailTemplateMapper(fallback);
    }

    return EmailTemplateMapper(emailTemplate);
  }
}
