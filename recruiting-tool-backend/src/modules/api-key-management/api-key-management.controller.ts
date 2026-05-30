import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { ApiKeyManagementService } from './api-key-management.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKeyResponseDto } from './dto/api-key-response.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';

@ApiTags('API Keys')
@ApiBearerAuth()
@Controller('api-keys')
@ApiUnauthorizedResponse({
  description: 'Unauthorized - Bearer token is missing, expired, or lacks required role',
})
export class ApiKeyManagementController {
  constructor(private readonly apiKeyManagementService: ApiKeyManagementService) {}

  @Post()
  @Auth(['COMPANY_OWNER', 'COMPANY_ADMIN', 'ADMIN', 'SUPER_ADMIN'])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new API key',
    description: 'Creates a new API key for the authenticated company. The raw key is returned ONLY in this response — store it securely as it cannot be retrieved again.',
  })
  @ApiResponse({
    status: 201,
    description: 'API key created successfully. The rawKey field contains the plaintext key (shown once).',
    type: ApiKeyResponseDto,
  })
  createKey(@Body() dto: CreateApiKeyDto, @CurrentUser() currentUser: any): Promise<ApiKeyResponseDto> {
    return this.apiKeyManagementService.create(currentUser.companyId, dto);
  }

  @Get()
  @Auth(['COMPANY_OWNER', 'COMPANY_ADMIN', 'ADMIN', 'SUPER_ADMIN'])
  @ApiOperation({
    summary: 'List all API keys for the current company',
    description: 'Returns all API keys belonging to the authenticated company. Raw keys are never included in list responses.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of API keys for the company.',
    type: [ApiKeyResponseDto],
  })
  listKeys(@CurrentUser() currentUser: any): Promise<ApiKeyResponseDto[]> {
    return this.apiKeyManagementService.findAll(currentUser.companyId);
  }

  @Delete(':uid')
  @Auth(['COMPANY_OWNER', 'COMPANY_ADMIN', 'ADMIN', 'SUPER_ADMIN'])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Revoke an API key',
    description: 'Disables the API key (sets isActive = false). The key record is retained for audit purposes.',
  })
  @ApiResponse({
    status: 204,
    description: 'API key revoked successfully.',
  })
  @ApiNotFoundResponse({ description: 'API key not found or does not belong to the current company.' })
  @ApiParam({ name: 'uid', description: 'UID of the API key to revoke' })
  async revokeKey(@Param('uid') uid: string, @CurrentUser() currentUser: any): Promise<void> {
    return this.apiKeyManagementService.revoke(uid, currentUser.companyId);
  }

  @Patch(':uid')
  @Auth(['COMPANY_OWNER', 'COMPANY_ADMIN', 'ADMIN', 'SUPER_ADMIN'])
  @ApiOperation({
    summary: 'Update an API key',
    description: 'Updates the name, expiration date, or active status of an API key.',
  })
  @ApiResponse({
    status: 200,
    description: 'API key updated successfully.',
    type: ApiKeyResponseDto,
  })
  @ApiNotFoundResponse({ description: 'API key not found or does not belong to the current company.' })
  @ApiParam({ name: 'uid', description: 'UID of the API key to update' })
  updateKey(@Param('uid') uid: string, @Body() dto: UpdateApiKeyDto, @CurrentUser() currentUser: any): Promise<ApiKeyResponseDto> {
    return this.apiKeyManagementService.update(uid, currentUser.companyId, dto);
  }
}
