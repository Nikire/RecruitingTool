import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { DatabaseService } from '../shared/modules/database/database.service';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateType } from '@prisma/client';
import {
  CreateCampaignDto,
  UpdateLeadDto,
  CampaignResponseDto,
  LeadResponseDto,
  ImportResultDto,
  ConvertResultDto,
  BulkLeadItemDto,
  OutreachLeadStatus,
  OutreachLeadChannel,
  SendLeadEmailDto,
  SendLeadEmailResultDto,
  PreviewEmailResultDto,
  SendTestEmailDto,
  SendTestEmailResultDto,
} from './dto/outreach-campaign.dto';
import { EmailService } from '../email/email.service';
import { EmailTemplatesService } from '../email-templates/email-templates.service';
import { UnsubscribeService } from '../unsubscribe/unsubscribe.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClient = any;

@Injectable()
export class OutreachCampaignsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    private readonly emailTemplatesService: EmailTemplatesService,
    private readonly unsubscribeService: UnsubscribeService,
  ) {}

  // ─── Campaigns ──────────────────────────────────────────────────────────────

  async findAllCampaigns(_userId: number): Promise<CampaignResponseDto[]> {
    const db = this.prisma as PrismaClient;
    const campaigns = await db.outreachCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        leads: { select: { status: true } },
      },
    });

    return campaigns.map((c: PrismaClient) => this.mapCampaign(c));
  }

  async createCampaign(dto: CreateCampaignDto, userId: number): Promise<CampaignResponseDto> {
    const db = this.prisma as PrismaClient;
    const campaign = await db.outreachCampaign.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        createdById: userId,
      },
      include: {
        leads: { select: { status: true } },
      },
    });

    return this.mapCampaign(campaign);
  }

  async deleteCampaign(uid: string): Promise<void> {
    const db = this.prisma as PrismaClient;
    const campaign = await db.outreachCampaign.findUnique({ where: { uid } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    await db.outreachLead.deleteMany({ where: { campaignId: campaign.id } });
    await db.outreachCampaign.delete({ where: { uid } });
  }

  // ─── Leads ──────────────────────────────────────────────────────────────────

  async findLeads(campaignUid: string, filters: { status?: string; channel?: string }): Promise<LeadResponseDto[]> {
    const db = this.prisma as PrismaClient;
    const campaign = await db.outreachCampaign.findUnique({ where: { uid: campaignUid } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const where: Record<string, unknown> = { campaignId: campaign.id };
    if (filters.status) where.status = filters.status;
    if (filters.channel) where.channel = filters.channel;

    const leads = await db.outreachLead.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return leads.map((l: PrismaClient) => this.mapLead(l));
  }

  async importLeads(campaignUid: string, fileBuffer: Buffer, userId: number): Promise<ImportResultDto> {
    const db = this.prisma as PrismaClient;
    const campaign = await db.outreachCampaign.findUnique({ where: { uid: campaignUid } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const rows = await this.parseCSV(fileBuffer);

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const firstName = (row['firstname'] || row['first name'] || row['first_name'] || '').trim();
      const lastName = (row['lastname'] || row['last name'] || row['last_name'] || '').trim();
      const name = firstName && lastName ? `${firstName} ${lastName}` : (firstName || lastName || row['name'] || '').trim();
      const company = (row['companyname'] || row['company name'] || row['company_name'] || row['company'] || '').trim();
      const email = (row['email'] || row['primaryemail'] || row['primary email'] || '').trim() || null;
      const linkedinUrl =
        (row['personlinkedinurl'] || row['person linkedin url'] || row['person_linkedin_url'] || row['linkedinurl'] || row['linkedin_url'] || row['linkedin'] || '').trim() || null;
      const title = (row['title'] || row['jobtitle'] || row['job title'] || '').trim() || null;
      const companySize = (row['#employees'] || row['employees'] || '').trim() || null;
      const industry = (row['industry'] || '').trim() || null;
      const country = (row['country'] || row['companycountry'] || row['company country'] || '').trim() || null;

      if (!name && !company) {
        skipped++;
        continue;
      }

      const notes = [title, industry, companySize ? `${companySize} employees` : null, country].filter(Boolean).join(' | ') || null;

      await db.outreachLead.create({
        data: {
          name: name || company,
          company: company || name,
          email,
          linkedinUrl,
          notes,
          campaignId: campaign.id,
          createdById: userId,
        },
      });
      imported++;
    }

    return { imported, skipped };
  }

  async updateLead(campaignUid: string, leadUid: string, dto: UpdateLeadDto, _userId: number): Promise<LeadResponseDto> {
    const db = this.prisma as PrismaClient;
    const campaign = await db.outreachCampaign.findUnique({ where: { uid: campaignUid } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const lead = await db.outreachLead.findFirst({
      where: { uid: leadUid, campaignId: campaign.id },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const previousStatus: string = lead.status;

    const updateData: Record<string, unknown> = {};
    if (dto.channel !== undefined) updateData.channel = dto.channel;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await db.outreachLead.update({
      where: { uid: leadUid },
      data: updateData,
    });

    // Fire n8n webhook when status changes to SENT
    if (dto.status === OutreachLeadStatus.SENT && previousStatus !== OutreachLeadStatus.SENT) {
      await this.fireN8nWebhook(updated);
    }

    return this.mapLead(updated);
  }

  async convertLead(campaignUid: string, leadUid: string, userId: number): Promise<ConvertResultDto> {
    const db = this.prisma as PrismaClient;
    const campaign = await db.outreachCampaign.findUnique({ where: { uid: campaignUid } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const lead = await db.outreachLead.findFirst({
      where: { uid: leadUid, campaignId: campaign.id },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    if (lead.convertedToProspectAt) {
      throw new BadRequestException('Lead already converted to CRM prospect');
    }

    // Create ProspectCompany
    const prospect = await (this.prisma as PrismaClient).prospectCompany.create({
      data: {
        name: lead.company,
        source: 'OTHER',
        createdById: userId,
      },
    });

    // Create OutreachContact
    await (this.prisma as PrismaClient).outreachContact.create({
      data: {
        prospectCompanyId: prospect.id,
        name: lead.name,
        email: lead.email ?? null,
        linkedinUrl: lead.linkedinUrl ?? null,
        isPrimary: true,
      },
    });

    // Mark lead as converted
    await db.outreachLead.update({
      where: { uid: leadUid },
      data: {
        status: OutreachLeadStatus.CONVERTED,
        prospectUid: prospect.uid,
        convertedToProspectAt: new Date(),
      },
    });

    return { prospectUid: prospect.uid };
  }

  async bulkCreateLeads(campaignUid: string, leads: BulkLeadItemDto[]): Promise<ImportResultDto> {
    const db = this.prisma as PrismaClient;
    const campaign = await db.outreachCampaign.findUnique({ where: { uid: campaignUid } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    // Fetch all existing non-null emails for this campaign (lower-cased for case-insensitive comparison)
    const existingLeads = await db.outreachLead.findMany({
      where: { campaignId: campaign.id, email: { not: null } },
      select: { email: true },
    });
    const existingEmails = new Set(existingLeads.map((l) => l.email!.toLowerCase()));

    let imported = 0;
    let skipped = 0;
    const toCreate: {
      name: string;
      company: string;
      email: string | null;
      linkedinUrl: string | null;
      notes: string | null;
      campaignId: number;
    }[] = [];
    // Track emails added within this batch to prevent intra-batch duplicates
    const batchEmails = new Set<string>();

    for (const lead of leads) {
      if (!lead.name && !lead.company) {
        skipped++;
        continue;
      }

      // Deduplicate by email (skip if email already exists in campaign or current batch)
      if (lead.email) {
        const normalised = lead.email.toLowerCase();
        if (existingEmails.has(normalised) || batchEmails.has(normalised)) {
          skipped++;
          continue;
        }
        batchEmails.add(normalised);
      }

      toCreate.push({
        name: lead.name || lead.company,
        company: lead.company || lead.name,
        email: lead.email ?? null,
        linkedinUrl: lead.linkedinUrl ?? null,
        notes: lead.notes ?? null,
        campaignId: campaign.id,
      });
      imported++;
    }

    if (toCreate.length > 0) {
      await db.outreachLead.createMany({ data: toCreate });
    }

    return { imported, skipped };
  }

  // ─── Send Email ─────────────────────────────────────────────────────────────

  async sendLeadEmail(
    campaignUid: string,
    leadUid: string,
    dto: SendLeadEmailDto,
    requestingUser: { id: number; name: string; companyId: number | null },
  ): Promise<SendLeadEmailResultDto> {
    const db = this.prisma as PrismaClient;

    // 1. Find campaign
    const campaign = await db.outreachCampaign.findUnique({ where: { uid: campaignUid } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    // 2. Find lead within campaign
    const lead = await db.outreachLead.findFirst({
      where: { uid: leadUid, campaignId: campaign.id },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    if (!lead.email) {
      throw new BadRequestException('This lead has no email address');
    }

    // 3. Resolve template
    let template: { uid: string; name: string; subject: string; body: string } | null = null;

    if (dto.templateUid) {
      // Use explicitly provided template
      const found = await db.emailTemplate.findUnique({ where: { uid: dto.templateUid } });
      if (!found) throw new NotFoundException(`Email template ${dto.templateUid} not found`);
      template = found;
    } else {
      // Look up default OUTREACH template for the user's company
      if (requestingUser.companyId) {
        const found = await db.emailTemplate.findFirst({
          where: {
            companyId: requestingUser.companyId,
            type: EmailTemplateType.OUTREACH,
          },
          orderBy: { isDefault: 'desc' as const },
        });
        if (found) template = found;
      }

      // Fallback: any OUTREACH template (no company scope)
      if (!template) {
        const found = await db.emailTemplate.findFirst({
          where: { type: EmailTemplateType.OUTREACH },
          orderBy: { createdAt: 'desc' as const },
        });
        if (found) template = found;
      }

      if (!template) {
        throw new NotFoundException('No OUTREACH email template found. Please create one in Email Templates.');
      }
    }

    // 4. Check unsubscribe list
    const unsubscribed = await this.unsubscribeService.isEmailUnsubscribed(lead.email);
    if (unsubscribed) {
      throw new BadRequestException('This email address has unsubscribed and cannot receive emails.');
    }

    // 4b. Generate unsubscribe token and URL
    const { randomBytes } = await import('crypto');
    const unsubscribeToken = randomBytes(32).toString('hex');
    await db.emailUnsubscribe.create({ data: { email: lead.email, token: unsubscribeToken } });
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'https://app.borderlessats.com');
    const unsubscribeUrl = `${frontendUrl}/unsubscribe/${unsubscribeToken}`;

    // 5. Build Handlebars variables
    const firstName = lead.name ? lead.name.split(' ')[0] : lead.name;
    const variables: Record<string, string> = {
      firstName,
      company: lead.company,
      senderName: requestingUser.name,
      unsubscribeUrl,
    };

    // 6. Render subject and body
    const renderedSubject = this.emailTemplatesService.renderTemplate(template.subject, variables);
    const renderedBody = this.emailTemplatesService.renderTemplate(template.body, variables);

    // 7. Send via Resend API using the private method on EmailService
    const emailFrom = this.config.get<string>('EMAIL_FROM', 'noreply@borderlessats.com');
    const smtpEnabled = this.config.get<string>('SMTP_ENABLED', 'false') === 'true';

    let resendEmailId: string | null = null;
    let deliveryStatus = 'SENT';

    if (smtpEnabled) {
      // Access the private sendViaResendApi by delegating through the public sendEmailFromTemplate
      // Instead we replicate the minimal send directly here
      const apiKey = this.config.get<string>('SMTP_PASSWORD');
      const adminBcc = this.config.get<string>('EMAIL_ADMIN_BCC');
      const isHtml = /<[a-z][\s\S]*>/i.test(renderedBody);
      const htmlBody = isHtml ? renderedBody : renderedBody.replace(/\n/g, '<br>');

      const payload: Record<string, unknown> = {
        from: emailFrom,
        to: [lead.email],
        subject: renderedSubject,
        text: renderedBody,
        html: htmlBody,
      };
      if (adminBcc && adminBcc !== lead.email) {
        payload.bcc = [adminBcc];
      }

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Resend API error ${response.status}: ${error}`);
        }
        const data = (await response.json()) as { id?: string };
        resendEmailId = data.id ?? null;
      } catch (err) {
        deliveryStatus = 'FAILED';
        throw new BadRequestException(`Failed to send email: ${(err as Error).message}`);
      }
    }
    // In dev mode we just log and continue (no throw)

    // 7. Log to EmailLog
    const emailLog = await db.emailLog.create({
      data: {
        recipientEmail: lead.email,
        recipientName: lead.name,
        subject: renderedSubject,
        template: renderedBody,
        status: deliveryStatus,
        emailType: 'OUTREACH',
        relatedEntity: 'OutreachLead',
        relatedEntityId: lead.uid,
        resendEmailId: resendEmailId ?? null,
        deliveryStatus,
      },
    });

    // 8. Create OutreachActivity
    if (requestingUser.companyId) {
      // Find a ProspectCompany linked to this lead if it exists
      let prospectCompanyId: number | null = null;
      if (lead.prospectUid) {
        const prospect = await db.prospectCompany.findUnique({ where: { uid: lead.prospectUid } });
        if (prospect) prospectCompanyId = prospect.id;
      }

      if (!prospectCompanyId) {
        // Create a lightweight prospect placeholder or find by name
        const existing = await db.prospectCompany.findFirst({ where: { name: lead.company } });
        if (existing) {
          prospectCompanyId = existing.id;
        } else {
          const newProspect = await db.prospectCompany.create({
            data: {
              name: lead.company,
              source: 'OTHER',
              createdById: requestingUser.id,
            },
          });
          prospectCompanyId = newProspect.id;
          // Link lead to this prospect
          await db.outreachLead.update({
            where: { uid: leadUid },
            data: { prospectUid: newProspect.uid },
          });
        }
      }

      await db.outreachActivity.create({
        data: {
          prospectCompanyId,
          type: 'MESSAGE_SENT',
          channel: 'EMAIL',
          templateUsed: template.name,
          notes: renderedSubject,
          createdById: requestingUser.id,
        },
      });
    }

    // 9. Update lead status to SENT
    await db.outreachLead.update({
      where: { uid: leadUid },
      data: { status: OutreachLeadStatus.SENT },
    });

    return { success: true, emailLogUid: emailLog.uid };
  }

  // ─── Preview Email ───────────────────────────────────────────────────────────

  async previewLeadEmail(campaignUid: string, leadUid: string, requestingUser: { id: number; name: string; companyId: number | null }): Promise<PreviewEmailResultDto> {
    const db = this.prisma as PrismaClient;

    // 1. Find campaign
    const campaign = await db.outreachCampaign.findUnique({ where: { uid: campaignUid } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    // 2. Find lead within campaign
    const lead = await db.outreachLead.findFirst({
      where: { uid: leadUid, campaignId: campaign.id },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    // 3. Resolve template (same logic as sendLeadEmail)
    let template: { uid: string; name: string; subject: string; body: string } | null = null;

    if (requestingUser.companyId) {
      const found = await db.emailTemplate.findFirst({
        where: {
          companyId: requestingUser.companyId,
          type: EmailTemplateType.OUTREACH,
        },
        orderBy: { isDefault: 'desc' as const },
      });
      if (found) template = found;
    }

    if (!template) {
      const found = await db.emailTemplate.findFirst({
        where: { type: EmailTemplateType.OUTREACH },
        orderBy: { createdAt: 'desc' as const },
      });
      if (found) template = found;
    }

    if (!template) {
      throw new NotFoundException('No OUTREACH email template found. Please create one in Email Templates.');
    }

    // 4. Build Handlebars variables
    const firstName = lead.name ? lead.name.split(' ')[0] : lead.name;
    const variables: Record<string, string> = {
      firstName,
      company: lead.company,
      senderName: requestingUser.name,
    };

    // 5. Render subject and body (no send)
    const renderedSubject = this.emailTemplatesService.renderTemplate(template.subject, variables);
    const renderedBody = this.emailTemplatesService.renderTemplate(template.body, variables);

    return {
      subject: renderedSubject,
      body: renderedBody,
      templateName: template.name,
    };
  }

  // ─── Send Test Email ─────────────────────────────────────────────────────────

  async sendTestEmail(campaignUid: string, dto: SendTestEmailDto, requestingUser: { id: number; name: string; companyId: number | null }): Promise<SendTestEmailResultDto> {
    const db = this.prisma as PrismaClient;

    // 1. Verify campaign exists
    const campaign = await db.outreachCampaign.findUnique({ where: { uid: campaignUid } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    // 2. Resolve template
    let template: { uid: string; name: string; subject: string; body: string } | null = null;

    if (dto.templateUid) {
      const found = await db.emailTemplate.findUnique({ where: { uid: dto.templateUid } });
      if (!found) throw new NotFoundException(`Email template ${dto.templateUid} not found`);
      template = found;
    } else {
      if (requestingUser.companyId) {
        const found = await db.emailTemplate.findFirst({
          where: {
            companyId: requestingUser.companyId,
            type: EmailTemplateType.OUTREACH,
          },
          orderBy: { isDefault: 'desc' as const },
        });
        if (found) template = found;
      }

      if (!template) {
        const found = await db.emailTemplate.findFirst({
          where: { type: EmailTemplateType.OUTREACH },
          orderBy: { createdAt: 'desc' as const },
        });
        if (found) template = found;
      }

      if (!template) {
        throw new NotFoundException('No OUTREACH email template found. Please create one in Email Templates.');
      }
    }

    // 3. Build dummy variables
    const dummyName = dto.dummyName ?? 'John Doe';
    const dummyCompany = dto.dummyCompany ?? 'Acme Corp';
    const firstName = dummyName.split(' ')[0];
    const variables: Record<string, string> = {
      firstName,
      company: dummyCompany,
      senderName: requestingUser.name,
    };

    // 4. Render subject and body
    const renderedSubject = this.emailTemplatesService.renderTemplate(template.subject, variables);
    const renderedBody = this.emailTemplatesService.renderTemplate(template.body, variables);

    // 5. Get requesting user's email from DB
    const userRecord = await db.user.findUnique({ where: { id: requestingUser.id }, select: { email: true } });
    if (!userRecord?.email) {
      throw new BadRequestException('Could not determine your email address to send the test');
    }
    const recipientEmail: string = userRecord.email;

    // 6. Send via Resend if SMTP enabled
    const emailFrom = this.config.get<string>('EMAIL_FROM', 'noreply@borderlessats.com');
    const smtpEnabled = this.config.get<string>('SMTP_ENABLED', 'false') === 'true';

    if (smtpEnabled) {
      const apiKey = this.config.get<string>('SMTP_PASSWORD');
      const isHtml = /<[a-z][\s\S]*>/i.test(renderedBody);
      const htmlBody = isHtml ? renderedBody : renderedBody.replace(/\n/g, '<br>');

      const payload: Record<string, unknown> = {
        from: emailFrom,
        to: [recipientEmail],
        subject: `[TEST] ${renderedSubject}`,
        text: renderedBody,
        html: htmlBody,
      };

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new BadRequestException(`Failed to send test email: Resend API error ${response.status}: ${error}`);
      }
    }

    return { success: true, sentTo: recipientEmail };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async parseCSV(buffer: Buffer): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const rows: Record<string, string>[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(
          csv({
            mapHeaders: ({ header }) => header.trim().toLowerCase().replace(/\s+/g, ''),
          }),
        )
        .on('data', (row: Record<string, string>) => {
          const trimmed: Record<string, string> = {};
          for (const key of Object.keys(row)) {
            trimmed[key] = typeof row[key] === 'string' ? row[key].trim() : row[key];
          }
          rows.push(trimmed);
        })
        .on('end', () => resolve(rows))
        .on('error', (err: Error) => reject(err));
    });
  }

  private async fireN8nWebhook(lead: { uid: string; name: string; company: string; email: string | null; channel: string }): Promise<void> {
    const webhookUrl = this.config.get<string>('N8N_OUTREACH_WEBHOOK_URL');
    if (!webhookUrl) return;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'outreach_lead_sent',
          leadUid: lead.uid,
          name: lead.name,
          company: lead.company,
          email: lead.email ?? null,
          channel: lead.channel,
          sentAt: new Date().toISOString(),
        }),
      });
    } catch {
      // Silently ignore webhook errors
    }
  }

  private mapCampaign(c: { uid: string; name: string; description: string | null; createdAt: Date; updatedAt: Date; leads: Array<{ status: string }> }): CampaignResponseDto {
    const counts = { total: 0, pending: 0, sent: 0, replied: 0, converted: 0 };
    for (const lead of c.leads) {
      counts.total++;
      if (lead.status === 'PENDING') counts.pending++;
      else if (lead.status === 'SENT') counts.sent++;
      else if (lead.status === 'REPLIED') counts.replied++;
      else if (lead.status === 'CONVERTED') counts.converted++;
    }

    return {
      uid: c.uid,
      name: c.name,
      description: c.description ?? undefined,
      leadCounts: counts,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }

  private mapLead(lead: {
    uid: string;
    name: string;
    company: string;
    email: string | null;
    linkedinUrl: string | null;
    channel: string;
    status: string;
    notes: string | null;
    convertedToProspectAt: Date | null;
    prospectUid: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): LeadResponseDto {
    return {
      uid: lead.uid,
      name: lead.name,
      company: lead.company,
      email: lead.email ?? undefined,
      linkedinUrl: lead.linkedinUrl ?? undefined,
      channel: lead.channel as OutreachLeadChannel,
      status: lead.status as OutreachLeadStatus,
      notes: lead.notes ?? undefined,
      convertedToProspectAt: lead.convertedToProspectAt?.toISOString(),
      prospectUid: lead.prospectUid ?? undefined,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    };
  }
}
