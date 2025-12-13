import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto, EmailTemplateResponseDto } from './dto/email-template.dto';
import { EmailTemplateMapper } from './entities/email-template.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { CacheService } from '../cache/cache.service';
import * as Handlebars from 'handlebars';

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
}
