import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    // getOrThrow, NOT get(key, default): a default here meant that an unset
    // INTERNAL_API_KEY silently made the guard accept the literal string
    // 'changeme' on a public HTTPS host, exposing endpoints that send mail
    // from the production sender. Fail loudly at request time instead.
    const validApiKey = this.configService.getOrThrow<string>('INTERNAL_API_KEY');

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}
