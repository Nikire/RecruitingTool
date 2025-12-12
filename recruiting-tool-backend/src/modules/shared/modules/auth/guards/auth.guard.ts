import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
