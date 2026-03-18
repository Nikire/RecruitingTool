import { Injectable, HttpException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyResponseDto,
  PublicCompanyResponseDto,
  CompanyUserResponseDto,
  TransferOwnershipDto,
  ForceJoinDto,
  UpdateCompanyProfileDto,
  CompanyProfileResponseDto,
} from './dto/company.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CompanyMapper, CompanyProfileMapper, includeCompany } from './entities/company.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { EntityNotFoundException } from 'src/common/exceptions';
import { CacheService } from '../cache/cache.service';
import { FilesService } from '../storage/files.service';

@Injectable()
export class CompanyService {
  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
    private filesService: FilesService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    try {
      const newCompany = await this.databaseService.company.create({
        data: {
          name: createCompanyDto.name,
          description: createCompanyDto.description,
        },
        include: includeCompany,
      });

      // Invalidate companies cache after creation
      await this.cacheService.invalidate('company');

      return CompanyMapper(newCompany);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to create: ${error.message}`);
    }
  }

  async list(paginationDto: PaginationDto): Promise<PaginatedResponse<CompanyResponseDto>> {
    try {
      const { page = 1, pageSize = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
      const skip = (page - 1) * pageSize;

      // Build where clause for search
      const where = search
        ? {
            OR: [{ name: { contains: search, mode: 'insensitive' as const } }],
          }
        : {};

      // Get total count
      const total = await this.databaseService.company.count({ where });

      // Get paginated data
      const companies = await this.databaseService.company.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: includeCompany,
      });

      const totalPages = Math.ceil(total / pageSize);

      return {
        data: companies.map((company) => CompanyMapper(company)),
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
      throw new InternalServerErrorException(`Failed to list: ${error.message}`);
    }
  }

  async findAll(): Promise<Array<CompanyResponseDto>> {
    try {
      const companies = await this.databaseService.company.findMany({
        include: includeCompany,
      });
      return companies.map((company) => CompanyMapper(company));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find all: ${error.message}`);
    }
  }

  async findAllPublicWithJobs(): Promise<Array<PublicCompanyResponseDto>> {
    try {
      // Find all companies that have at least one OPEN job position
      const companies = await this.databaseService.company.findMany({
        where: {
          jobPositions: {
            some: {
              status: 'OPEN',
              deletedAt: null, // Exclude soft-deleted job positions
            },
          },
        },
        select: {
          uid: true,
          name: true,
          logoUrl: true,
          website: true,
          industry: true,
          description: true,
        },
        orderBy: {
          name: 'asc', // Alphabetical order for dropdown
        },
      });

      return companies;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find all public companies with jobs: ${error.message}`);
    }
  }

  async findOne(uid: string): Promise<CompanyResponseDto> {
    try {
      const company = await this.databaseService.company.findUnique({
        where: { uid },
        include: includeCompany,
      });

      if (!company) {
        throw new EntityNotFoundException('Company', uid);
      }

      return CompanyMapper(company);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find one: ${error.message}`);
    }
  }

  async update(uid: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyResponseDto> {
    try {
      const company = await this.databaseService.company.update({
        where: { uid },
        data: updateCompanyDto,
        include: includeCompany,
      });

      if (!company) {
        throw new EntityNotFoundException('Company', uid);
      }

      // Invalidate cache for this specific company and all companies
      await this.cacheService.invalidate(`company:${uid}`);
      await this.cacheService.invalidate('company');

      return CompanyMapper(company);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to update: ${error.message}`);
    }
  }

  async remove(uid: string): Promise<MessageResponseDto> {
    try {
      const company = await this.databaseService.company.delete({
        where: { uid },
      });

      if (!company) {
        throw new EntityNotFoundException('Company', uid);
      }

      // Invalidate cache after deletion
      await this.cacheService.invalidate('company');

      return { message: `Company deleted successfully` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to remove: ${error.message}`);
    }
  }

  async getCompanyUsers(uid: string, paginationDto: PaginationDto): Promise<PaginatedResponse<CompanyUserResponseDto>> {
    try {
      const company = await this.databaseService.company.findUnique({
        where: { uid },
        select: { id: true },
      });

      if (!company) {
        throw new EntityNotFoundException('Company', uid);
      }

      const { page = 1, pageSize = 20, search } = paginationDto;
      const skip = (page - 1) * pageSize;

      const where = {
        companyId: company.id,
        ...(search
          ? {
              OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }],
            }
          : {}),
      };

      const total = await this.databaseService.user.count({ where });

      const users = await this.databaseService.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          uid: true,
          name: true,
          email: true,
          roles: true,
          isActive: true,
          position: true,
          department: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      const totalPages = Math.ceil(total / pageSize);

      return {
        data: users.map((user) => ({
          uid: user.uid,
          name: user.name,
          email: user.email,
          roles: user.roles as string[],
          isActive: user.isActive,
          position: user.position ?? undefined,
          department: user.department ?? undefined,
          lastLoginAt: user.lastLoginAt ?? undefined,
          createdAt: user.createdAt,
        })),
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
      throw new InternalServerErrorException(`Failed to get company users: ${error.message}`);
    }
  }

  async transferOwnership(uid: string, dto: TransferOwnershipDto): Promise<{ message: string; previousOwner: CompanyUserResponseDto; newOwner: CompanyUserResponseDto }> {
    try {
      const company = await this.databaseService.company.findUnique({
        where: { uid },
        select: { id: true },
      });

      if (!company) {
        throw new EntityNotFoundException('Company', uid);
      }

      // Find the current COMPANY_OWNER in this company
      const currentOwner = await this.databaseService.user.findFirst({
        where: {
          companyId: company.id,
          roles: { has: 'COMPANY_OWNER' as any },
        },
      });

      if (!currentOwner) {
        throw new BadRequestException('No current COMPANY_OWNER found in this company');
      }

      // Find the new owner (must be a member of the company)
      const newOwnerUser = await this.databaseService.user.findFirst({
        where: {
          uid: dto.newOwnerUid,
          companyId: company.id,
        },
      });

      if (!newOwnerUser) {
        throw new BadRequestException('New owner must be an existing member of this company');
      }

      if (currentOwner.uid === newOwnerUser.uid) {
        throw new BadRequestException('New owner is already the current COMPANY_OWNER');
      }

      // Remove COMPANY_OWNER from previous owner's roles (keep other roles)
      const previousOwnerRoles = (currentOwner.roles as string[]).filter((r) => r !== 'COMPANY_OWNER');

      const updatedPreviousOwner = await this.databaseService.user.update({
        where: { id: currentOwner.id },
        data: { roles: previousOwnerRoles as any },
        select: {
          uid: true,
          name: true,
          email: true,
          roles: true,
          isActive: true,
          position: true,
          department: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      // Add COMPANY_OWNER to new owner's roles (avoid duplicates)
      const newOwnerRoles = Array.from(new Set([...(newOwnerUser.roles as string[]), 'COMPANY_OWNER']));

      const updatedNewOwner = await this.databaseService.user.update({
        where: { id: newOwnerUser.id },
        data: { roles: newOwnerRoles as any },
        select: {
          uid: true,
          name: true,
          email: true,
          roles: true,
          isActive: true,
          position: true,
          department: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      // Invalidate company cache
      await this.cacheService.invalidate(`company:${uid}`);
      await this.cacheService.invalidate('company');

      return {
        message: 'Ownership transferred successfully',
        previousOwner: {
          uid: updatedPreviousOwner.uid,
          name: updatedPreviousOwner.name,
          email: updatedPreviousOwner.email,
          roles: updatedPreviousOwner.roles as string[],
          isActive: updatedPreviousOwner.isActive,
          position: updatedPreviousOwner.position ?? undefined,
          department: updatedPreviousOwner.department ?? undefined,
          lastLoginAt: updatedPreviousOwner.lastLoginAt ?? undefined,
          createdAt: updatedPreviousOwner.createdAt,
        },
        newOwner: {
          uid: updatedNewOwner.uid,
          name: updatedNewOwner.name,
          email: updatedNewOwner.email,
          roles: updatedNewOwner.roles as string[],
          isActive: updatedNewOwner.isActive,
          position: updatedNewOwner.position ?? undefined,
          department: updatedNewOwner.department ?? undefined,
          lastLoginAt: updatedNewOwner.lastLoginAt ?? undefined,
          createdAt: updatedNewOwner.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to transfer ownership: ${error.message}`);
    }
  }

  async forceJoinUser(uid: string, dto: ForceJoinDto): Promise<{ message: string; user: CompanyUserResponseDto }> {
    try {
      const company = await this.databaseService.company.findUnique({
        where: { uid },
        select: { id: true },
      });

      if (!company) {
        throw new EntityNotFoundException('Company', uid);
      }

      // Look up user by uid
      const user = await this.databaseService.user.findUnique({
        where: { uid: dto.userUid },
      });

      if (!user) {
        throw new EntityNotFoundException('User', dto.userUid);
      }

      const roleToAssign = dto.role || 'HR';

      // Add role if not already present
      const existingRoles = user.roles as string[];
      const updatedRoles = existingRoles.includes(roleToAssign) ? existingRoles : [...existingRoles, roleToAssign];

      // Update user: set companyId and add role
      const updatedUser = await this.databaseService.user.update({
        where: { id: user.id },
        data: {
          companyId: company.id,
          roles: updatedRoles as any,
        },
        select: {
          uid: true,
          name: true,
          email: true,
          roles: true,
          isActive: true,
          position: true,
          department: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      // Invalidate company cache
      await this.cacheService.invalidate(`company:${uid}`);
      await this.cacheService.invalidate('company');

      return {
        message: `User ${updatedUser.name} successfully joined the company`,
        user: {
          uid: updatedUser.uid,
          name: updatedUser.name,
          email: updatedUser.email,
          roles: updatedUser.roles as string[],
          isActive: updatedUser.isActive,
          position: updatedUser.position ?? undefined,
          department: updatedUser.department ?? undefined,
          lastLoginAt: updatedUser.lastLoginAt ?? undefined,
          createdAt: updatedUser.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to force join user: ${error.message}`);
    }
  }

  async getMyCompanyProfile(userCompanyId: number): Promise<CompanyProfileResponseDto> {
    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: userCompanyId },
      });

      if (!company) {
        throw new EntityNotFoundException('Company', String(userCompanyId));
      }

      return CompanyProfileMapper(company);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get company profile: ${error.message}`);
    }
  }

  async updateMyCompanyProfile(userCompanyId: number, dto: UpdateCompanyProfileDto): Promise<CompanyProfileResponseDto> {
    try {
      const company = await this.databaseService.company.update({
        where: { id: userCompanyId },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.website !== undefined && { website: dto.website }),
          ...(dto.industry !== undefined && { industry: dto.industry }),
          ...(dto.companySize !== undefined && { companySize: dto.companySize }),
          ...(dto.foundedYear !== undefined && { foundedYear: dto.foundedYear }),
          ...(dto.location !== undefined && { location: dto.location }),
          ...(dto.linkedinUrl !== undefined && { linkedinUrl: dto.linkedinUrl }),
          ...(dto.twitterUrl !== undefined && { twitterUrl: dto.twitterUrl }),
          ...(dto.instagramUrl !== undefined && { instagramUrl: dto.instagramUrl }),
          ...(dto.careersEnabled !== undefined && { careersEnabled: dto.careersEnabled }),
          ...(dto.careersHeadline !== undefined && { careersHeadline: dto.careersHeadline }),
          ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        },
      });

      // Invalidate company caches
      await this.cacheService.invalidate(`company:${company.uid}`);
      await this.cacheService.invalidate('company');

      return CompanyProfileMapper(company);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to update company profile: ${error.message}`);
    }
  }

  async uploadLogoForMyCompany(userCompanyId: number, file: Express.Multer.File, userUid: string): Promise<CompanyProfileResponseDto> {
    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: userCompanyId },
      });

      if (!company) {
        throw new EntityNotFoundException('Company', String(userCompanyId));
      }

      const uploadedFile = await this.filesService.uploadFile(file, userUid);

      const updatedCompany = await this.databaseService.company.update({
        where: { id: userCompanyId },
        data: { logoUrl: uploadedFile.downloadUrl },
      });

      await this.cacheService.invalidate(`company:${company.uid}`);
      await this.cacheService.invalidate('company');

      return CompanyProfileMapper(updatedCompany);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to upload logo: ${error.message}`);
    }
  }

  async uploadLogo(uid: string, file: Express.Multer.File, userUid: string): Promise<CompanyResponseDto> {
    try {
      // Verify company exists
      const company = await this.databaseService.company.findUnique({
        where: { uid },
      });

      if (!company) {
        throw new EntityNotFoundException('Company', uid);
      }

      // Upload file using existing file upload service
      const uploadedFile = await this.filesService.uploadFile(file, userUid);

      // Update company with logo URL
      const updatedCompany = await this.databaseService.company.update({
        where: { uid },
        data: { logoUrl: uploadedFile.downloadUrl },
        include: includeCompany,
      });

      // Invalidate cache
      await this.cacheService.invalidate(`company:${uid}`);
      await this.cacheService.invalidate('company');

      return CompanyMapper(updatedCompany);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to upload logo: ${error.message}`);
    }
  }
}
