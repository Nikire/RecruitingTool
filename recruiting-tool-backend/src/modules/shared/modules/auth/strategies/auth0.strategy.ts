import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

/**
 * Auth0 JWT Strategy
 *
 * This strategy validates Auth0 JWT tokens using JWKS (JSON Web Key Set).
 * It fetches the public keys from Auth0's JWKS endpoint to verify token signatures.
 *
 * Tokens are extracted from the Authorization header as Bearer tokens.
 *
 * This strategy is optional - the application will work without Auth0 configuration.
 */
@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  private readonly isConfigured: boolean;

  constructor(configService: ConfigService) {
    const auth0Domain = configService.get<string>('AUTH0_DOMAIN');
    const auth0Audience = configService.get<string>('AUTH0_AUDIENCE');
    const isConfigured = !!(auth0Domain && auth0Audience);

    // Build configuration based on whether Auth0 is configured
    if (isConfigured) {
      super({
        // Extract JWT from Authorization header
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

        // Dynamically fetch JWKS from Auth0
        secretOrKeyProvider: passportJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
        }),

        // Verify audience (API identifier)
        audience: auth0Audience,

        // Verify issuer (Auth0 domain)
        issuer: `https://${auth0Domain}/`,

        // Ensure token hasn't expired
        ignoreExpiration: false,

        // Use RS256 algorithm (Auth0 default)
        algorithms: ['RS256'],
      });
    } else {
      // Placeholder config when Auth0 is not configured
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'placeholder',
        ignoreExpiration: true,
      });
    }

    this.isConfigured = isConfigured;

    if (isConfigured) {
      console.log('[Auth0Strategy] Initialized successfully');
    } else {
      console.log('[Auth0Strategy] Auth0 not configured - social login disabled');
    }
  }

  /**
   * Validate the JWT payload after signature verification
   *
   * @param payload - Decoded JWT payload from Auth0
   * @returns User information extracted from the token
   */
  async validate(payload: any) {
    // If Auth0 not configured, reject
    if (!this.isConfigured) {
      throw new UnauthorizedException('Auth0 not configured');
    }

    // Validate required claims
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing subject claim');
    }

    // Extract user info from token
    // Auth0 'sub' format: "auth0|..." or "google-oauth2|..." or "github|..."
    return {
      auth0Id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
      provider: this.extractProvider(payload.sub),
      emailVerified: payload.email_verified,
    };
  }

  /**
   * Extract provider from Auth0 sub claim
   *
   * @param sub - Auth0 subject claim (e.g., "google-oauth2|123456")
   * @returns Provider name (e.g., "google", "github", "auth0")
   */
  private extractProvider(sub: string): string {
    const parts = sub.split('|');
    if (parts.length < 2) return 'auth0';

    const providerMap: Record<string, string> = {
      'google-oauth2': 'google',
      github: 'github',
      auth0: 'auth0',
      twitter: 'twitter',
      linkedin: 'linkedin',
      facebook: 'facebook',
    };

    return providerMap[parts[0]] || parts[0];
  }
}
