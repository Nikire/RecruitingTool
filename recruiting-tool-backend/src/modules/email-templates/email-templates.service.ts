import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto, EmailTemplateResponseDto } from './dto/email-template.dto';
import { EmailTemplateMapper } from './entities/email-template.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';

@Injectable()
export class EmailTemplatesService {
  constructor(private databaseService: DatabaseService) {}

  async create(createDto: CreateEmailTemplateDto, userId: number): Promise<EmailTemplateResponseDto> {
    // Find company by UID to get numeric ID
    const company = await this.databaseService.company.findUnique({
      where: { uid: createDto.companyUid },
    });

    if (!company) {
      throw new NotFoundException(`Company ${createDto.companyUid} not found`);
    }

    // Verify user exists
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const emailTemplate = await this.databaseService.emailTemplate.create({
      data: {
        name: createDto.name,
        subject: createDto.subject,
        body: createDto.body,
        companyId: company.id,
        createdById: userId,
        isDefault: createDto.isDefault || false,
      },
      include: {
        company: true,
        createdBy: true,
      },
    });

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

    const emailTemplate = await this.databaseService.emailTemplate.update({
      where: { uid },
      data: {
        name: updateDto.name,
        subject: updateDto.subject,
        body: updateDto.body,
        isDefault: updateDto.isDefault,
      },
      include: {
        company: true,
        createdBy: true,
      },
    });

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

    return { message: 'Email template deleted successfully' };
  }
}
