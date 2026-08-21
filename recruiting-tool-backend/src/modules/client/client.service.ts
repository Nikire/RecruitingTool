import { ConflictException, ForbiddenException, HttpException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { DatabaseService } from '../shared/modules/database/database.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ClientFiltersDto, ClientResponseDto, CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { ClientMapper, includeClientCounts } from './entities/client.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { PaginatedResponse } from 'src/dto/pagination.dto';
import { EntityNotFoundException } from 'src/common/exceptions';
import { getUserCompanyId, verifyCompanyAccess } from 'src/utils/company-access.helper';

/**
 * CRUD for an agency end clients (accounts).
 *
 * TENANCY
 * -------
 * Every read is scoped through `getUserCompanyId`, the deny-by-default helper hardened in
 * Phase 2 - it returns null ONLY for SUPER_ADMIN and throws for a user with no company.
 * The scope is applied inside the WHERE clause rather than as a post-fetch check, so a
 * cross-tenant UID produces a plain 404 and never confirms that the UID exists.
 */
@Injectable()
export class ClientService {
  constructor(
    @Inject(DatabaseService) private readonly databaseService: DatabaseService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * The company a write must land in.
   *
   * Unlike a read, a write cannot be global: even a SUPER_ADMIN has to name a concrete
   * owning agency, and the only one we can infer is the one on their own user record.
   */
  private resolveWriteCompanyId(user: User): number {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company to manage clients');
    }
    return user.companyId;
  }

  /**
   * WHERE fragment restricting a query to the caller tenant.
   * Returns `{}` for SUPER_ADMIN, the only role with cross-company visibility.
   */
  private tenantScope(user: User): Prisma.ClientWhereInput {
    const userCompanyId = getUserCompanyId(user);
    return userCompanyId === null ? {} : { companyId: userCompanyId };
  }

  async list(filters: ClientFiltersDto, user: User): Promise<PaginatedResponse<ClientResponseDto>> {
    try {
      const { page = 1, pageSize = 10, search, sortBy = 'name', sortOrder = 'asc', status } = filters;
      const skip = (page - 1) * pageSize;

      const where: Prisma.ClientWhereInput = {
        ...this.tenantScope(user),
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { contactName: { contains: search, mode: 'insensitive' } },
          { contactEmail: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) {
        where.status = status;
      }

      const total = await this.databaseService.client.count({ where });

      const clients = await this.databaseService.client.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: includeClientCounts,
      });

      const totalPages = Math.ceil(total / pageSize);

      return {
        data: clients.map((client) => ClientMapper(client)),
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to list clients: ${error.message}`);
    }
  }

  /**
   * Unpaginated list for pickers and filter dropdowns (the client filter on the job
   * positions / hiring processes lists). Returns only the caller own clients.
   */
  async findAll(user: User): Promise<ClientResponseDto[]> {
    try {
      const clients = await this.databaseService.client.findMany({
        where: { ...this.tenantScope(user), deletedAt: null },
        orderBy: { name: 'asc' },
        include: includeClientCounts,
      });

      return clients.map((client) => ClientMapper(client));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find all clients: ${error.message}`);
    }
  }

  async findOne(uid: string, user: User): Promise<ClientResponseDto> {
    try {
      const client = await this.databaseService.client.findFirst({
        where: { uid, deletedAt: null, ...this.tenantScope(user) },
        include: includeClientCounts,
      });

      if (!client) {
        throw new EntityNotFoundException('Client', uid);
      }

      return ClientMapper(client);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find client: ${error.message}`);
    }
  }

  async create(createClientDto: CreateClientDto, user: User): Promise<ClientResponseDto> {
    const companyId = this.resolveWriteCompanyId(user);

    try {
      const client = await this.databaseService.client.create({
        data: {
          name: createClientDto.name,
          slug: createClientDto.slug ?? null,
          logoUrl: createClientDto.logoUrl ?? null,
          contactName: createClientDto.contactName ?? null,
          contactEmail: createClientDto.contactEmail ?? null,
          notes: createClientDto.notes ?? null,
          ...(createClientDto.status ? { status: createClientDto.status } : {}),
          company: { connect: { id: companyId } },
        },
        include: includeClientCounts,
      });

      return ClientMapper(client);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Slug is unique per company; surface the collision instead of a 500.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('A client with this slug already exists in your company');
      }
      throw new InternalServerErrorException(`Failed to create client: ${error.message}`);
    }
  }

  async update(uid: string, updateClientDto: UpdateClientDto, user: User): Promise<ClientResponseDto> {
    try {
      const existing = await this.databaseService.client.findFirst({
        where: { uid, deletedAt: null, ...this.tenantScope(user) },
      });

      if (!existing) {
        throw new EntityNotFoundException('Client', uid);
      }

      // Defence in depth: the WHERE above already scoped the lookup.
      verifyCompanyAccess(user, existing.companyId);

      const data: Prisma.ClientUpdateInput = {};
      if (updateClientDto.name !== undefined) data.name = updateClientDto.name;
      if (updateClientDto.slug !== undefined) data.slug = updateClientDto.slug;
      if (updateClientDto.logoUrl !== undefined) data.logoUrl = updateClientDto.logoUrl;
      if (updateClientDto.contactName !== undefined) data.contactName = updateClientDto.contactName;
      if (updateClientDto.contactEmail !== undefined) data.contactEmail = updateClientDto.contactEmail;
      if (updateClientDto.notes !== undefined) data.notes = updateClientDto.notes;
      if (updateClientDto.status !== undefined) data.status = updateClientDto.status;

      const client = await this.databaseService.client.update({
        where: { id: existing.id },
        data,
        include: includeClientCounts,
      });

      return ClientMapper(client);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('A client with this slug already exists in your company');
      }
      throw new InternalServerErrorException(`Failed to update client: ${error.message}`);
    }
  }

  /**
   * Soft delete, matching the convention used by JobPosition / Candidate.
   *
   * Job positions pointing at this client are deliberately NOT deleted: the role still
   * exists, it simply loses its client attribution. `clientId` is left in place so the
   * link is restored if the client is ever undeleted.
   */
  async remove(uid: string, user: User): Promise<MessageResponseDto> {
    try {
      const existing = await this.databaseService.client.findFirst({
        where: { uid, deletedAt: null, ...this.tenantScope(user) },
      });

      if (!existing) {
        throw new EntityNotFoundException('Client', uid);
      }

      verifyCompanyAccess(user, existing.companyId);

      await this.databaseService.client.update({
        where: { id: existing.id },
        data: { deletedAt: new Date() },
      });

      await this.auditLogService.logAction({
        action: 'SOFT_DELETE',
        entityType: 'Client',
        entityId: existing.id,
        entityUid: existing.uid,
        user,
        metadata: { name: existing.name, companyId: existing.companyId },
      });

      return { message: 'Client deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to remove client: ${error.message}`);
    }
  }
}
