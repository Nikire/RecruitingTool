import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { ProspectStatus } from '@prisma/client';
import { CreateProspectCompanyDto, UpdateProspectCompanyDto, CreateOutreachContactDto, CreateOutreachActivityDto, ProspectListQueryDto } from './dto/prospect-tracking.dto';

@Injectable()
export class ProspectTrackingService {
  constructor(private readonly prisma: DatabaseService) {}

  async findAll(query: ProspectListQueryDto) {
    const { page = 1, limit = 50, search, status, source, tag, featured } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (source) where.source = source;
    if (tag) where.tags = { has: tag };
    if (featured === 'true') where.isFeatured = true;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.prospectCompany.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          contacts: { where: { isPrimary: true }, take: 1 },
          activities: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.prospectCompany.count({ where }),
    ]);

    return {
      data: data.map((p) => this.mapProspect(p)),
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async getStats() {
    const [total, contacted, demoScheduled, converted] = await this.prisma.$transaction([
      this.prisma.prospectCompany.count(),
      this.prisma.prospectCompany.count({
        where: {
          status: {
            in: [
              ProspectStatus.CONTACTED,
              ProspectStatus.FOLLOW_UP_1,
              ProspectStatus.FOLLOW_UP_2,
              ProspectStatus.RESPONDED,
              ProspectStatus.DEMO_SCHEDULED,
              ProspectStatus.DEMO_DONE,
              ProspectStatus.PROPOSAL_SENT,
            ],
          },
        },
      }),
      this.prisma.prospectCompany.count({ where: { status: ProspectStatus.DEMO_SCHEDULED } }),
      this.prisma.prospectCompany.count({ where: { status: ProspectStatus.CONVERTED } }),
    ]);
    return { total, contacted, demoScheduled, converted };
  }

  async findOne(uid: string) {
    const prospect = await this.prisma.prospectCompany.findUnique({
      where: { uid },
      include: {
        contacts: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { uid: true, name: true } } },
        },
      },
    });
    if (!prospect) throw new NotFoundException('Prospect not found');
    return this.mapProspect(prospect);
  }

  async create(dto: CreateProspectCompanyDto, userId: number) {
    const prospect = await this.prisma.prospectCompany.create({
      data: {
        ...dto,
        tags: dto.tags ?? [],
        isFeatured: dto.isFeatured ?? false,
        createdById: userId,
      },
      include: { contacts: true, activities: true },
    });
    return this.mapProspect(prospect);
  }

  async update(uid: string, dto: UpdateProspectCompanyDto, userId: number) {
    const existing = await this.prisma.prospectCompany.findUnique({ where: { uid } });
    if (!existing) throw new NotFoundException('Prospect not found');

    const updated = await this.prisma.prospectCompany.update({
      where: { uid },
      data: dto,
      include: { contacts: true, activities: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });

    // Auto-log status change
    if (dto.status && dto.status !== existing.status) {
      await this.prisma.outreachActivity.create({
        data: {
          prospectCompanyId: existing.id,
          type: 'STATUS_CHANGED',
          previousStatus: existing.status,
          newStatus: dto.status,
          createdById: userId,
        },
      });
    }

    return this.mapProspect(updated);
  }

  async remove(uid: string) {
    const existing = await this.prisma.prospectCompany.findUnique({ where: { uid } });
    if (!existing) throw new NotFoundException('Prospect not found');
    await this.prisma.prospectCompany.delete({ where: { uid } });
  }

  async addContact(uid: string, dto: CreateOutreachContactDto) {
    const prospect = await this.prisma.prospectCompany.findUnique({ where: { uid } });
    if (!prospect) throw new NotFoundException('Prospect not found');

    if (dto.isPrimary) {
      await this.prisma.outreachContact.updateMany({
        where: { prospectCompanyId: prospect.id },
        data: { isPrimary: false },
      });
    }

    const contact = await this.prisma.outreachContact.create({
      data: { ...dto, prospectCompanyId: prospect.id },
    });
    return {
      uid: contact.uid,
      name: contact.name,
      role: contact.role,
      email: contact.email,
      linkedinUrl: contact.linkedinUrl,
      phone: contact.phone,
      isPrimary: contact.isPrimary,
    };
  }

  async removeContact(uid: string, contactUid: string) {
    const contact = await this.prisma.outreachContact.findUnique({ where: { uid: contactUid } });
    if (!contact) throw new NotFoundException('Contact not found');
    await this.prisma.outreachContact.delete({ where: { uid: contactUid } });
  }

  async addActivity(uid: string, dto: CreateOutreachActivityDto, userId: number) {
    const prospect = await this.prisma.prospectCompany.findUnique({ where: { uid } });
    if (!prospect) throw new NotFoundException('Prospect not found');

    const activity = await this.prisma.outreachActivity.create({
      data: {
        prospectCompanyId: prospect.id,
        type: dto.type,
        channel: dto.channel,
        notes: dto.notes,
        templateUsed: dto.templateUsed,
        previousStatus: dto.newStatus ? prospect.status : undefined,
        newStatus: dto.newStatus,
        createdById: userId,
      },
      include: { createdBy: { select: { uid: true, name: true } } },
    });

    if (dto.newStatus && dto.newStatus !== prospect.status) {
      await this.prisma.prospectCompany.update({
        where: { uid },
        data: { status: dto.newStatus },
      });
    }

    return {
      uid: activity.uid,
      type: activity.type,
      channel: activity.channel,
      notes: activity.notes,
      templateUsed: activity.templateUsed,
      previousStatus: activity.previousStatus,
      newStatus: activity.newStatus,
      createdAt: activity.createdAt.toISOString(),
      createdBy: activity.createdBy ? { uid: activity.createdBy.uid, name: activity.createdBy.name } : undefined,
    };
  }

  private mapProspect(p: {
    uid: string;
    name: string;
    website?: string | null;
    industry?: string | null;
    companySize?: string | null;
    country?: string | null;
    city?: string | null;
    source: string;
    status: string;
    notes?: string | null;
    tags: string[];
    isFeatured: boolean;
    contacts?: Array<{
      uid: string;
      name: string;
      role?: string | null;
      email?: string | null;
      linkedinUrl?: string | null;
      phone?: string | null;
      isPrimary: boolean;
    }>;
    activities?: Array<{
      uid: string;
      type: string;
      channel?: string | null;
      notes?: string | null;
      templateUsed?: string | null;
      previousStatus?: string | null;
      newStatus?: string | null;
      createdAt: Date;
      createdBy?: { uid: string; name: string } | null;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      uid: p.uid,
      name: p.name,
      website: p.website ?? undefined,
      industry: p.industry ?? undefined,
      companySize: p.companySize ?? undefined,
      country: p.country ?? undefined,
      city: p.city ?? undefined,
      source: p.source,
      status: p.status,
      notes: p.notes ?? undefined,
      tags: p.tags,
      isFeatured: p.isFeatured,
      contacts: p.contacts?.map((c) => ({
        uid: c.uid,
        name: c.name,
        role: c.role ?? undefined,
        email: c.email ?? undefined,
        linkedinUrl: c.linkedinUrl ?? undefined,
        phone: c.phone ?? undefined,
        isPrimary: c.isPrimary,
      })),
      activities: p.activities?.map((a) => ({
        uid: a.uid,
        type: a.type,
        channel: a.channel ?? undefined,
        notes: a.notes ?? undefined,
        templateUsed: a.templateUsed ?? undefined,
        previousStatus: a.previousStatus ?? undefined,
        newStatus: a.newStatus ?? undefined,
        createdAt: a.createdAt.toISOString(),
        createdBy: a.createdBy ? { uid: a.createdBy.uid, name: a.createdBy.name } : undefined,
      })),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      lastActivityAt: p.activities?.[0]?.createdAt?.toISOString() ?? null,
    };
  }
}
