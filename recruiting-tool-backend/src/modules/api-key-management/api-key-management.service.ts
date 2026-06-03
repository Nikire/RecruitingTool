import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { ApiKeyCryptoService } from '../../public-api/services/api-key-crypto.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKeyResponseDto } from './dto/api-key-response.dto';
import { ApiKey } from '@prisma/client';

@Injectable()
export class ApiKeyManagementService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly apiKeyCryptoService: ApiKeyCryptoService,
  ) {}

  /**
   * Creates a new API key for the given company.
   * The rawKey is returned ONLY in this response and can never be retrieved again.
   */
  async create(companyId: number, dto: CreateApiKeyDto): Promise<ApiKeyResponseDto> {
    const { rawKey, hashedKey, keyPrefix } = this.apiKeyCryptoService.generate();

    const apiKey = await this.databaseService.apiKey.create({
      data: {
        name: dto.name,
        key: hashedKey,
        keyPrefix,
        companyId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        scopes: dto.scopes ?? [],
        isActive: true,
      },
    });

    return {
      ...this.mapToResponseDto(apiKey),
      rawKey,
    };
  }

  /**
   * Lists all API keys belonging to the given company.
   * The rawKey is never included in list responses.
   */
  async findAll(companyId: number): Promise<ApiKeyResponseDto[]> {
    const apiKeys = await this.databaseService.apiKey.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    return apiKeys.map((apiKey) => this.mapToResponseDto(apiKey));
  }

  /**
   * Revokes an API key by setting isActive = false (soft disable).
   * Throws NotFoundException if the key does not belong to the company.
   */
  async revoke(uid: string, companyId: number): Promise<void> {
    await this.resolveApiKey(uid, companyId);

    await this.databaseService.apiKey.update({
      where: { uid },
      data: { isActive: false },
    });
  }

  /**
   * Updates mutable fields (name, expiresAt, isActive) of an API key.
   * Throws NotFoundException if the key does not belong to the company.
   */
  async update(uid: string, companyId: number, dto: UpdateApiKeyDto): Promise<ApiKeyResponseDto> {
    await this.resolveApiKey(uid, companyId);

    const updated = await this.databaseService.apiKey.update({
      where: { uid },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.expiresAt !== undefined && { expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    return this.mapToResponseDto(updated);
  }

  /**
   * Resolves an API key by UID, ensuring it belongs to the given company.
   * Throws NotFoundException if not found or belongs to a different company.
   */
  private async resolveApiKey(uid: string, companyId: number): Promise<ApiKey> {
    const apiKey = await this.databaseService.apiKey.findFirst({
      where: { uid, companyId },
    });

    if (!apiKey) {
      throw new NotFoundException(`API key with UID "${uid}" not found`);
    }

    return apiKey;
  }

  private mapToResponseDto(apiKey: ApiKey): ApiKeyResponseDto {
    return {
      uid: apiKey.uid,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      isActive: apiKey.isActive,
      scopes: apiKey.scopes,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }
}
