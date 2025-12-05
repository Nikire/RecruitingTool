import { Injectable, NotFoundException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { CreateCompanyDto, UpdateCompanyDto, CompanyResponseDto } from './dto/company.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CompanyMapper, includeCompany } from './entities/company.entity';
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
