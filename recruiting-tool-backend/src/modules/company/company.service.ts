import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto, UpdateCompanyDto, CompanyResponseDto } from './dto/company.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CompanyMapper, includeCompany } from './entities/company.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';

@Injectable()
export class CompanyService {
  constructor(private databaseService: DatabaseService) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    const newCompany = await this.databaseService.company.create({
      data: {
        name: createCompanyDto.name,
        description: createCompanyDto.description,
      },
      include: includeCompany,
    });

    return CompanyMapper(newCompany);
  }

  async list(paginationDto: PaginationDto): Promise<PaginatedResponse<CompanyResponseDto>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

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
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: includeCompany,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: companies.map((company) => CompanyMapper(company)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findAll(): Promise<Array<CompanyResponseDto>> {
    const companies = await this.databaseService.company.findMany({
      include: includeCompany,
    });
    return companies.map((company) => CompanyMapper(company));
  }

  async findOne(uid: string): Promise<CompanyResponseDto> {
    const company = await this.databaseService.company.findUnique({
      where: { uid },
      include: includeCompany,
    });

    if (!company) {
      throw new NotFoundException(`Company ${uid} not found`);
    }

    return CompanyMapper(company);
  }

  async update(uid: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyResponseDto> {
    const company = await this.databaseService.company.update({
      where: { uid },
      data: updateCompanyDto,
      include: includeCompany,
    });

    if (!company) {
      throw new NotFoundException(`Company ${uid} not found`);
    }

    return CompanyMapper(company);
  }

  async remove(uid: string): Promise<MessageResponseDto> {
    const company = await this.databaseService.company.delete({
      where: { uid },
    });

    if (!company) {
      throw new NotFoundException(`Company ${uid} not found`);
    }

    return { message: `Company deleted successfully` };
  }
}
