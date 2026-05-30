import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../modules/shared/modules/database/database.service';
import { ApiKeyCryptoService } from '../services/api-key-crypto.service';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private readonly db: DatabaseService,
    private readonly crypto: ApiKeyCryptoService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rawKey = this.extractKey(request);

    if (!rawKey || !rawKey.startsWith('blss_')) {
      throw new UnauthorizedException('Valid API key required');
    }

    const prefix = rawKey.substring(0, 16);
    const candidates = await this.db.apiKey.findMany({
      where: { keyPrefix: prefix, isActive: true },
      include: { company: true },
    });

    let matchedKey = null;
    for (const candidate of candidates) {
      const isMatch = await this.crypto.compare(rawKey, candidate.key);
      if (isMatch) {
        matchedKey = candidate;
        break;
      }
    }

    if (!matchedKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (matchedKey.expiresAt && matchedKey.expiresAt < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    // Update lastUsedAt asynchronously (don't await)
    this.db.apiKey
      .update({
        where: { id: matchedKey.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {});

    request.apiKeyCompany = matchedKey.company;
    request.apiKey = matchedKey;
    return true;
  }

  private extractKey(request: any): string | null {
    const xApiKey = request.headers['x-api-key'];
    if (xApiKey) return xApiKey;

    const auth = request.headers['authorization'];
    if (auth?.startsWith('Bearer ')) {
      const token = auth.substring(7);
      if (token.startsWith('blss_')) return token;
    }
    return null;
  }
}
