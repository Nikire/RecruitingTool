import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RolesType } from '@prisma/client';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AdminUserService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminUserService.name);

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}
  async onApplicationBootstrap() {
    const ADMIN_EMAIL = this.configService.get<string>('ADMIN_EMAIL');
    const ADMIN_NAME = this.configService.get<string>('ADMIN_NAME');
    const ADMIN_PASSWORD = this.configService.get<string>('ADMIN_PASSWORD');
    if (ADMIN_EMAIL && ADMIN_NAME && ADMIN_PASSWORD) {
      const admin = await this.usersService.findByEmail(ADMIN_EMAIL);
      if (!admin) {
        this.logger.log('Creating admin user...');
        await this.usersService.createInternal({
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          password: ADMIN_PASSWORD,
          roles: [RolesType.USER, RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN],
        });
      } else {
        this.logger.log(`Admin user found: ${admin.email}`);
      }
    }
  }
}
