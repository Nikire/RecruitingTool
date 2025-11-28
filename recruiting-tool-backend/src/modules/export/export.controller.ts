import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { ExportService } from './export.service';
import { ExportRequestDto } from './dto/export-request.dto';
import { ExportResponseDto } from './dto/export-response.dto';
import { ExportTemplatesResponseDto } from './dto/export-templates.dto';

@ApiTags('Export')
@ApiBearerAuth()
@Controller('export')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Auth(['HR', 'ADMIN'])
  @Get('templates')
  @ApiOperation({ summary: 'Get available export templates and columns' })
  @ApiResponse({
    status: 200,
    description: 'Returns available export templates',
    type: ExportTemplatesResponseDto,
  })
  getTemplates(): Promise<ExportTemplatesResponseDto> {
    return this.exportService.getTemplates();
  }

  @Auth(['HR', 'ADMIN'])
  @Post()
  @ApiOperation({ summary: 'Generate export file (CSV or PDF)' })
  @ApiResponse({
    status: 201,
    description: 'Export file generated successfully',
    type: ExportResponseDto,
  })
  @ApiBody({ type: ExportRequestDto })
  async export(@CurrentUser() currentUser: User, @Body() exportRequestDto: ExportRequestDto): Promise<ExportResponseDto> {
    return this.exportService.export(exportRequestDto, currentUser.companyId);
  }
}
