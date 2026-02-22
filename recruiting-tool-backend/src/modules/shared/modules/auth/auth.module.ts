import { forwardRef, Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constants';
import { UsersModule } from 'src/modules/users/users.module';
import { TokenCleanupService } from './services/token-cleanup.service';
import { Auth0Strategy } from './strategies/auth0.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from 'src/modules/email/email.module';

@Global()
@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    ConfigModule,
    EmailModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenCleanupService, Auth0Strategy],
  exports: [AuthService],
})
export class AuthModule {}
