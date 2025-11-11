import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto, CompanyResponseDto } from './dto/company.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { MessageResponseDto } from 'src/dto/responses.dto';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @Auth(['SUPER_ADMIN'])
  @ApiOperation({ summary: 'Create a new company (SUPER_ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Company created successfully', type: CompanyResponseDto })
  create(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @Auth(['SUPER_ADMIN'])
  @ApiOperation({ summary: 'Get all companies (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully', type: [CompanyResponseDto] })
  findAll(): Promise<Array<CompanyResponseDto>> {
    return this.companyService.findAll();
  }

  @Get(':uid')
  @Auth(['SUPER_ADMIN'])
  @ApiOperation({ summary: 'Get a company by UID (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully', type: CompanyResponseDto })
  findOne(@Param('uid') uid: string): Promise<CompanyResponseDto> {
    return this.companyService.findOne(uid);
  }

  @Put(':uid')
  @Auth(['SUPER_ADMIN'])
  @ApiOperation({ summary: 'Update a company (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Company updated successfully', type: CompanyResponseDto })
  update(@Param('uid') uid: string, @Body() updateCompanyDto: UpdateCompanyDto): Promise<CompanyResponseDto> {
    return this.companyService.update(uid, updateCompanyDto);
  }

  @Delete(':uid')
  @Auth(['SUPER_ADMIN'])
  @ApiOperation({ summary: 'Delete a company (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully', type: MessageResponseDto })
  remove(@Param('uid') uid: string): Promise<MessageResponseDto> {
    return this.companyService.remove(uid);
  }
}
