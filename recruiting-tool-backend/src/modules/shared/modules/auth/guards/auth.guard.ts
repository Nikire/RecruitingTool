import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/skip-auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    // Try to get token from Authorization header first
    const tokenString = request.headers['authorization'];
    let token: string | undefined;

    if (tokenString) {
      token = tokenString.split(' ')[1];
    } else {
      // Fallback: check for token in query parameters (for SSE connections)
      token = request.query?.token;
    }

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const user = await this.authService.verifyToken(token);
      request.currentUser = user;
      request.token = token;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
