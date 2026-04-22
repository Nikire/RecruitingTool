import { Controller, Get, Post, Body, Put, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyService } from './company.service';
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
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { FileValidationPipe } from '../storage/pipes/file-validation.pipe';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('public/with-jobs')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600000) // Cache for 10 minutes (same as public job positions)
  @ApiOperation({ summary: 'Get all companies with open job positions (Public - No auth required)' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of companies with at least one open job position',
    type: [PublicCompanyResponseDto],
  })
  findAllPublicWithJobs(): Promise<Array<PublicCompanyResponseDto>> {
    return this.companyService.findAllPublicWithJobs();
  }

  @Get('profile')
  @Auth(['COMPANY_OWNER', 'COMPANY_ADMIN', 'HR', 'HR_MANAGER', 'RECRUITER', 'ADMIN', 'SUPER_ADMIN'])
  @ApiOperation({ summary: 'Get current company profile (authenticated users of that company)' })
  @ApiResponse({ status: 200, description: 'Company profile retrieved successfully', type: CompanyProfileResponseDto })
  getMyProfile(@CurrentUser() currentUser: any): Promise<CompanyProfileResponseDto> {
    return this.companyService.getMyCompanyProfile(currentUser.companyId);
  }

  @Patch('profile')
  @Auth(['COMPANY_OWNER', 'COMPANY_ADMIN'])
  @ApiOperation({ summary: 'Update current company profile (COMPANY_OWNER, COMPANY_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Company profile updated successfully', type: CompanyProfileResponseDto })
  updateMyProfile(@Body() dto: UpdateCompanyProfileDto, @CurrentUser() currentUser: any): Promise<CompanyProfileResponseDto> {
    return this.companyService.updateMyCompanyProfile(currentUser.companyId, dto);
  }

  @Post('profile/logo')
  @Auth(['COMPANY_OWNER', 'COMPANY_ADMIN'])
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload company logo (COMPANY_OWNER, COMPANY_ADMIN only)' })
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
  @ApiResponse({ status: 200, description: 'Logo uploaded successfully', type: CompanyProfileResponseDto })
  async uploadMyLogo(
    @UploadedFile(new FileValidationPipe('image'))
    file: Express.Multer.File,
    @CurrentUser() currentUser: any,
  ): Promise<CompanyProfileResponseDto> {
    return this.companyService.uploadLogoForMyCompany(currentUser.companyId, file);
  }

  @Post()
  @Auth(['SUPER_ADMIN'])
  @ApiOperation({ summary: 'Create a new company (SUPER_ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Company created successfully', type: CompanyResponseDto })
  create(@Body() createCompanyDto: CreateCompanyDto, @CurrentUser() currentUser: any): Promise<CompanyResponseDto> {
    return this.companyService.create(createCompanyDto, currentUser?.id);
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

  @Get(':uid/users')
  @Auth(['SUPER_ADMIN'])
  @ApiOperation({ summary: 'Get paginated list of users for a company (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of company users', type: [CompanyUserResponseDto] })
  getCompanyUsers(@Param('uid') uid: string, @Query() paginationDto: PaginationDto): Promise<PaginatedResponse<CompanyUserResponseDto>> {
    return this.companyService.getCompanyUsers(uid, paginationDto);
  }

  @Post(':uid/transfer-ownership')
  @Auth(['SUPER_ADMIN'])
  @ApiOperation({ summary: 'Transfer company ownership to another member (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Ownership transferred successfully' })
  transferOwnership(
    @Param('uid') uid: string,
    @Body() dto: TransferOwnershipDto,
  ): Promise<{ message: string; previousOwner: CompanyUserResponseDto; newOwner: CompanyUserResponseDto }> {
    return this.companyService.transferOwnership(uid, dto);
  }

  @Post(':uid/force-join')
  @Auth(['SUPER_ADMIN'])
  @ApiOperation({ summary: 'Force a user to join a company (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'User successfully joined the company' })
  forceJoinUser(@Param('uid') uid: string, @Body() dto: ForceJoinDto): Promise<{ message: string; user: CompanyUserResponseDto }> {
    return this.companyService.forceJoinUser(uid, dto);
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
    @UploadedFile(new FileValidationPipe('image'))
    file: Express.Multer.File,
  ): Promise<CompanyResponseDto> {
    return this.companyService.uploadLogo(uid, file);
  }
}
