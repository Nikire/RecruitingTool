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
  ConvertLeadDto,
  BulkLeadItemDto,
  DailyCheckResultDto,
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

    // Parse with original headers (not lowercased) for Apollo columns
    const rows = await this.parseCSVRaw(fileBuffer);

    let imported = 0;
    let skipped = 0;

    // Fetch existing emails to deduplicate
    const existingLeads = await db.outreachLead.findMany({
      where: { campaignId: campaign.id, email: { not: null } },
      select: { email: true },
    });
    const existingEmails = new Set(existingLeads.map((l: { email: string }) => l.email!.toLowerCase()));
    const batchEmails = new Set<string>();

    for (const row of rows) {
      // Helper: get value from row by trying multiple key variants (original and lowercase)
      const get = (...keys: string[]): string => {
        for (const key of keys) {
          const v = row[key] ?? row[key.toLowerCase()] ?? row[key.toLowerCase().replace(/\s+/g, '')] ?? '';
          if (typeof v === 'string' && v.trim()) return v.trim();
        }
        return '';
      };

      const firstName = get('First Name', 'firstname', 'first_name');
      const lastName = get('Last Name', 'lastname', 'last_name');
      const name = firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName || lastName || get('name') || '';
      const company = get('Company Name', 'companyname', 'company_name', 'company');
      const email = get('Email', 'primaryemail', 'primary email') || null;
      const linkedinUrl = get('Person Linkedin Url', 'personlinkedinurl', 'person_linkedin_url', 'linkedinurl', 'linkedin_url', 'linkedin') || null;
      const title = get('Title', 'jobtitle', 'job title') || null;
      const phone = get('Work Direct Phone', 'Mobile Phone', 'Corporate Phone', 'phone') || null;
      const city = get('City', 'city') || null;
      const state = get('State', 'state') || null;
      const country = get('Country', 'companycountry', 'company country') || null;
      const website = get('Website', 'website') || null;
      const industry = get('Industry', 'industry') || null;
      const seniority = get('Seniority', 'seniority') || null;
      const apolloContactId = get('Apollo Contact Id', 'apollocontactid') || null;
      const apolloAccountId = get('Apollo Account Id', 'apolloaccountid') || null;
      const secondaryEmail = get('Secondary Email', 'secondaryemail') || null;
      const companySize = get('#Employees', '#employees', 'employees') || null;

      if (!name && !company) {
        skipped++;
        continue;
      }

      // Deduplicate by email
      if (email) {
        const normalised = email.toLowerCase();
        if (existingEmails.has(normalised) || batchEmails.has(normalised)) {
          skipped++;
          continue;
        }
        batchEmails.add(normalised);
      }

      // Legacy notes field (keep for backwards compat with non-Apollo imports)
      const notes = [title, industry, companySize ? `${companySize} employees` : null, country].filter(Boolean).join(' | ') || null;

      // Store entire row as apolloData for reference
      const apolloData: Record<string, unknown> = {};
      for (const k of Object.keys(row)) {
        if (row[k] !== undefined && row[k] !== '') {
          apolloData[k] = row[k];
        }
      }

      await db.outreachLead.create({
        data: {
          name: name || company,
          company: company || name,
          email,
          linkedinUrl,
          notes,
          campaignId: campaign.id,
          createdById: userId,
          firstName: firstName || null,
          lastName: lastName || null,
          title,
          phone,
          city,
          state,
          country,
          website,
          industry,
          seniority,
          apolloContactId,
          apolloAccountId,
          secondaryEmail,
          apolloData: Object.keys(apolloData).length > 0 ? apolloData : undefined,
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

    const updateData: Record<string, unknown> = {};
    if (dto.channel !== undefined) updateData.channel = dto.channel;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await db.outreachLead.update({
      where: { uid: leadUid },
      data: updateData,
    });

    return this.mapLead(updated);
  }

  async convertLead(campaignUid: string, leadUid: string, userId: number, dto: ConvertLeadDto): Promise<ConvertResultDto> {
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

    const tags: string[] = dto.tags ?? [];

    // Build CRM notes description from lead data
    const notes = this.buildCrmDescription(lead, campaign);

    // Create ProspectCompany with full Apollo data
    const prospect = await (this.prisma as PrismaClient).prospectCompany.create({
      data: {
        name: lead.company,
        source: 'APOLLO_CAMPAIGN',
        status: 'CONTACTED',
        campaignRef: campaign.name,
        website: lead.website ?? null,
        industry: lead.industry ?? null,
        country: lead.country ?? null,
        city: lead.city ?? null,
        tags: tags,
        notes,
        createdById: userId,
      },
    });

    // Create OutreachContact with role (title)
    await (this.prisma as PrismaClient).outreachContact.create({
      data: {
        prospectCompanyId: prospect.id,
        name: lead.name,
        role: lead.title ?? null,
        email: lead.email ?? null,
        linkedinUrl: lead.linkedinUrl ?? null,
        phone: lead.phone ?? null,
        isPrimary: true,
      },
    });

    // Log the outreach activity with the lead's channel
    await (this.prisma as PrismaClient).outreachActivity.create({
      data: {
        prospectCompanyId: prospect.id,
        type: 'MESSAGE_SENT',
        channel: lead.channel === 'EMAIL' ? 'EMAIL' : 'LINKEDIN',
        templateUsed: campaign.name,
        notes: `Added from outreach campaign: ${campaign.name}`,
        createdById: userId,
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
    const existingEmails = new Set(existingLeads.map((l: { email: string }) => l.email!.toLowerCase()));

    let imported = 0;
    let skipped = 0;
    const toCreate: {
      name: string;
      company: string;
      email: string | null;
      linkedinUrl: string | null;
      notes: string | null;
      campaignId: number;
      firstName?: string | null;
      lastName?: string | null;
      title?: string | null;
      phone?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
      website?: string | null;
      industry?: string | null;
      seniority?: string | null;
      apolloContactId?: string | null;
      apolloAccountId?: string | null;
      secondaryEmail?: string | null;
      apolloData?: Record<string, unknown>;
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
        firstName: lead.firstName ?? null,
        lastName: lead.lastName ?? null,
        title: lead.title ?? null,
        phone: lead.phone ?? null,
        city: lead.city ?? null,
        state: lead.state ?? null,
        country: lead.country ?? null,
        website: lead.website ?? null,
        industry: lead.industry ?? null,
        seniority: lead.seniority ?? null,
        apolloContactId: lead.apolloContactId ?? null,
        apolloAccountId: lead.apolloAccountId ?? null,
        secondaryEmail: lead.secondaryEmail ?? null,
        apolloData: lead.apolloData,
      });
      imported++;
    }

    if (toCreate.length > 0) {
      const result = await db.outreachLead.createMany({ data: toCreate, skipDuplicates: true });
      // Adjust imported count for any DB-level duplicates silently dropped
      imported = result.count;
      skipped += toCreate.length - result.count;
    }

    return { imported, skipped };
  }

  // ─── Daily Check ─────────────────────────────────────────────────────────────

  async dailyCheck(campaignUid: string): Promise<DailyCheckResultDto> {
    const db = this.prisma as PrismaClient;
    const campaign = await db.outreachCampaign.findUnique({ where: { uid: campaignUid } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const count = await db.outreachLead.count({
      where: { campaignId: campaign.id, createdAt: { gte: startOfToday } },
    });

    return { alreadyRanToday: count > 0, count };
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

    // 5. Build Handlebars variables (include Apollo fields)
    const firstName = lead.firstName ?? (lead.name ? lead.name.split(' ')[0] : lead.name);
    const variables: Record<string, string> = {
      firstName,
      company: lead.company,
      senderName: requestingUser.name,
      unsubscribeUrl,
      title: lead.title ?? '',
      lastName: lead.lastName ?? '',
      seniority: lead.seniority ?? '',
      industry: lead.industry ?? '',
      city: lead.city ?? '',
      country: lead.country ?? '',
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

    // 4. Build Handlebars variables (include Apollo fields)
    const firstName = lead.firstName ?? (lead.name ? lead.name.split(' ')[0] : lead.name);
    const variables: Record<string, string> = {
      firstName,
      company: lead.company,
      senderName: requestingUser.name,
      title: lead.title ?? '',
      lastName: lead.lastName ?? '',
      seniority: lead.seniority ?? '',
      industry: lead.industry ?? '',
      city: lead.city ?? '',
      country: lead.country ?? '',
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
      title: 'HR Director',
      lastName: dummyName.split(' ').slice(1).join(' ') || 'Doe',
      seniority: 'Senior',
      industry: 'Technology',
      city: 'New York',
      country: 'US',
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

  private buildCrmDescription(
    lead: {
      name: string;
      email?: string | null;
      secondaryEmail?: string | null;
      linkedinUrl?: string | null;
      title?: string | null;
      seniority?: string | null;
      channel?: string | null;
    },
    campaign: { name: string },
  ): string {
    const lines: string[] = [`Source: ${campaign.name} (Outreach Campaign)`, `Channel: ${lead.channel ?? 'Unknown'}`];
    if (lead.title) lines.push(`Title: ${lead.title}`);
    if (lead.seniority) lines.push(`Seniority: ${lead.seniority}`);

    lines.push('');
    lines.push('Contacts:');

    const contactParts: string[] = [lead.name];
    if (lead.email) contactParts.push(lead.email);
    if (lead.secondaryEmail) contactParts.push(lead.secondaryEmail);
    if (lead.linkedinUrl) contactParts.push(lead.linkedinUrl);
    lines.push(`- ${contactParts.join(' | ')}`);

    return lines.join('\n');
  }

  private async parseCSVRaw(buffer: Buffer): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const rows: Record<string, string>[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(
          csv({
            // Keep original header casing so we can match Apollo columns exactly
            mapHeaders: ({ header }) => header.trim(),
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
    const counts = { total: 0, pending: 0, converted: 0 };
    for (const lead of c.leads) {
      counts.total++;
      if (lead.status === 'PENDING') counts.pending++;
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
    firstName?: string | null;
    lastName?: string | null;
    title?: string | null;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    website?: string | null;
    industry?: string | null;
    seniority?: string | null;
    apolloContactId?: string | null;
    apolloAccountId?: string | null;
    secondaryEmail?: string | null;
    apolloData?: Record<string, unknown> | null;
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
      firstName: lead.firstName ?? undefined,
      lastName: lead.lastName ?? undefined,
      title: lead.title ?? undefined,
      phone: lead.phone ?? undefined,
      city: lead.city ?? undefined,
      state: lead.state ?? undefined,
      country: lead.country ?? undefined,
      website: lead.website ?? undefined,
      industry: lead.industry ?? undefined,
      seniority: lead.seniority ?? undefined,
      apolloContactId: lead.apolloContactId ?? undefined,
      apolloAccountId: lead.apolloAccountId ?? undefined,
      secondaryEmail: lead.secondaryEmail ?? undefined,
      apolloData: (lead.apolloData as Record<string, unknown> | null) ?? undefined,
    };
  }
}
