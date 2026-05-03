import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { DatabaseService } from '../shared/modules/database/database.service';
import { ConfigService } from '@nestjs/config';
import {
  CreateCampaignDto,
  UpdateLeadDto,
  CampaignResponseDto,
  LeadResponseDto,
  ImportResultDto,
  ConvertResultDto,
  OutreachLeadStatus,
  OutreachLeadChannel,
} from './dto/outreach-campaign.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClient = any;

@Injectable()
export class OutreachCampaignsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly config: ConfigService,
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
      const name = (row['name'] || '').trim();
      const company = (row['company'] || '').trim();
      const email = (row['email'] || '').trim() || null;
      const linkedinUrl = (row['linkedinurl'] || row['linkedin_url'] || row['linkedin'] || '').trim() || null;

      if (!name && !company) {
        skipped++;
        continue;
      }

      await db.outreachLead.create({
        data: {
          name: name || company,
          company: company || name,
          email,
          linkedinUrl,
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
