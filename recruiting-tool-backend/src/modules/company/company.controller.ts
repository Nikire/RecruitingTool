import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto, CompanyResponseDto } from './dto/company.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { FileValidationPipe } from '../storage/pipes/file-validation.pipe';
import { Request } from 'express';

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

  @Get('list')
  @Auth(['SUPER_ADMIN'])
  @ApiOperation({ summary: 'Get paginated companies list with filtering (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated companies list' })
  list(@Query() paginationDto: PaginationDto): Promise<PaginatedResponse<CompanyResponseDto>> {
    return this.companyService.list(paginationDto);
  }

  @Get()
  @Auth(['SUPER_ADMIN'])
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // Cache for 5 minutes - companies rarely change
  @ApiOperation({ summary: 'Get all companies (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully', type: [CompanyResponseDto] })
  findAll(): Promise<Array<CompanyResponseDto>> {
    return this.companyService.findAll();
  }

  @Get(':uid')
  @Auth(['SUPER_ADMIN'])
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // Cache for 5 minutes
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

  @Post(':uid/logo')
  @Auth(['COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload company logo (COMPANY_OWNER, ADMIN, SUPER_ADMIN)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Logo uploaded successfully', type: CompanyResponseDto })
  async uploadLogo(
    @Param('uid') uid: string,
    @UploadedFile(
      new FileValidationPipe({
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
      }),
    )
    file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<CompanyResponseDto> {
    const userUid = (req.user as any)?.uid;
    return this.companyService.uploadLogo(uid, file, userUid);
  }
}
