import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RolesType } from '@prisma/client';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AdminUserService implements OnApplicationBootstrap {
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
        console.log('CREATING ADMIN USER...', '\n');
        await this.usersService.createInternal({
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          password: ADMIN_PASSWORD,
          roles: [RolesType.USER, RolesType.ADMIN, RolesType.SUPER_ADMIN],
        });
      } else {
        console.log('ADMIN USER FOUND:', admin, '\n');
      }
    }
  }
}
