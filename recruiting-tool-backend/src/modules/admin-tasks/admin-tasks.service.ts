import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CreateAdminTaskDto, UpdateAdminTaskDto, AdminTaskResponseDto } from './dto/admin-task.dto';

type PrismaAdminTask = {
  uid: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  labels: string[];
  assignedTo: { uid: string; name: string; email: string | null } | null;
  linkedCompany: { uid: string; name: string } | null;
  createdBy: { uid: string; name: string; email: string | null };
  createdAt: Date;
  updatedAt: Date;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPrisma = any;

@Injectable()
export class AdminTasksService {
  constructor(private readonly db: DatabaseService) {}

  private get adminTaskModel(): AnyPrisma {
    return (this.db as AnyPrisma).adminTask;
  }

  private mapTask(task: PrismaAdminTask): AdminTaskResponseDto {
    return {
      uid: task.uid,
      title: task.title,
      description: task.description ?? undefined,
      status: task.status as AdminTaskResponseDto['status'],
      priority: task.priority as AdminTaskResponseDto['priority'],
      dueDate: task.dueDate?.toISOString() ?? undefined,
      labels: task.labels,
      assignedTo: task.assignedTo ? { uid: task.assignedTo.uid, name: task.assignedTo.name, email: task.assignedTo.email ?? '' } : undefined,
      linkedCompany: task.linkedCompany ? { uid: task.linkedCompany.uid, name: task.linkedCompany.name } : undefined,
      createdBy: { uid: task.createdBy.uid, name: task.createdBy.name, email: task.createdBy.email ?? '' },
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  async findAll(): Promise<AdminTaskResponseDto[]> {
    const tasks: PrismaAdminTask[] = await this.adminTaskModel.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { uid: true, name: true, email: true } },
        linkedCompany: { select: { uid: true, name: true } },
        createdBy: { select: { uid: true, name: true, email: true } },
      },
    });
    return tasks.map((t) => this.mapTask(t));
  }

  async create(dto: CreateAdminTaskDto, creatorId: number): Promise<AdminTaskResponseDto> {
    let assignedToId: number | undefined;
    if (dto.assignedToUid) {
      const user = await this.db.user.findUnique({ where: { uid: dto.assignedToUid }, select: { id: true } });
      if (!user) throw new NotFoundException('Assigned user not found');
      assignedToId = user.id;
    }

    let linkedCompanyId: number | undefined;
    if (dto.linkedCompanyUid) {
      const company = await this.db.company.findUnique({ where: { uid: dto.linkedCompanyUid }, select: { id: true } });
      if (!company) throw new NotFoundException('Linked company not found');
      linkedCompanyId = company.id;
    }

    const task: PrismaAdminTask = await this.adminTaskModel.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        labels: dto.labels ?? [],
        assignedToId,
        linkedCompanyId,
        createdById: creatorId,
      },
      include: {
        assignedTo: { select: { uid: true, name: true, email: true } },
        linkedCompany: { select: { uid: true, name: true } },
        createdBy: { select: { uid: true, name: true, email: true } },
      },
    });
    return this.mapTask(task);
  }

  async update(uid: string, dto: UpdateAdminTaskDto): Promise<AdminTaskResponseDto> {
    const existing = await this.adminTaskModel.findUnique({ where: { uid }, select: { id: true } });
    if (!existing) throw new NotFoundException('Task not found');

    let assignedToId: number | null | undefined;
    if (dto.assignedToUid !== undefined) {
      if (dto.assignedToUid === '' || (dto.assignedToUid as unknown) === null) {
        assignedToId = null;
      } else {
        const user = await this.db.user.findUnique({ where: { uid: dto.assignedToUid }, select: { id: true } });
        if (!user) throw new NotFoundException('Assigned user not found');
        assignedToId = user.id;
      }
    }

    let linkedCompanyId: number | null | undefined;
    if (dto.linkedCompanyUid !== undefined) {
      if (dto.linkedCompanyUid === '' || (dto.linkedCompanyUid as unknown) === null) {
        linkedCompanyId = null;
      } else {
        const company = await this.db.company.findUnique({ where: { uid: dto.linkedCompanyUid }, select: { id: true } });
        if (!company) throw new NotFoundException('Linked company not found');
        linkedCompanyId = company.id;
      }
    }

    const task: PrismaAdminTask = await this.adminTaskModel.update({
      where: { uid },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
        ...(dto.labels !== undefined && { labels: dto.labels }),
        ...(assignedToId !== undefined && { assignedToId }),
        ...(linkedCompanyId !== undefined && { linkedCompanyId }),
      },
      include: {
        assignedTo: { select: { uid: true, name: true, email: true } },
        linkedCompany: { select: { uid: true, name: true } },
        createdBy: { select: { uid: true, name: true, email: true } },
      },
    });
    return this.mapTask(task);
  }

  async remove(uid: string): Promise<void> {
    const existing = await this.adminTaskModel.findUnique({ where: { uid }, select: { id: true } });
    if (!existing) throw new NotFoundException('Task not found');
    await this.adminTaskModel.delete({ where: { uid } });
  }
}
