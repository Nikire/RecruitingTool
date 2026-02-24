import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RolesType } from '@prisma/client';
import { UsersService } from 'src/modules/users/users.service';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdminUserService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminUserService.name);

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private db: DatabaseService,
  ) {}

  async onApplicationBootstrap() {
    const ADMIN_EMAIL = this.configService.get<string>('ADMIN_EMAIL');
    const ADMIN_NAME = this.configService.get<string>('ADMIN_NAME');
    const ADMIN_PASSWORD = this.configService.get<string>('ADMIN_PASSWORD');

    if (!ADMIN_EMAIL || !ADMIN_NAME || !ADMIN_PASSWORD) return;

    // Ensure the "Borderless" company exists
    let company = await this.db.company.findFirst({
      where: { name: 'Borderless' },
    });

    if (!company) {
      this.logger.log('Creating Borderless company...');
      company = await this.db.company.create({
        data: { name: 'Borderless' },
      });
    }

    // Ensure admin user exists
    let admin = await this.usersService.findByEmail(ADMIN_EMAIL);

    if (!admin) {
      this.logger.log('Creating admin user...');
      await this.usersService.createInternal({
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        password: ADMIN_PASSWORD,
        roles: [
          RolesType.USER,
          RolesType.HR,
          RolesType.ADMIN,
          RolesType.SUPER_ADMIN,
          RolesType.COMPANY_OWNER,
        ],
      });
      admin = await this.usersService.findByEmail(ADMIN_EMAIL);
    }

    if (!admin) return;

    // Ensure admin is linked to Borderless, is COMPANY_OWNER, and email is verified
    const needsUpdate =
      admin.companyId !== company.id ||
      !admin.emailVerified ||
      !admin.roles.includes(RolesType.COMPANY_OWNER);

    if (needsUpdate) {
      this.logger.log('Configuring admin user with Borderless company...');
      const roles = Array.from(
        new Set([...admin.roles, RolesType.COMPANY_OWNER]),
      );
      await this.db.user.update({
        where: { id: admin.id },
        data: {
          companyId: company.id,
          emailVerified: true,
          roles,
        },
      });
    } else {
      this.logger.log(`Admin user ready: ${admin.email}`);
    }
  }
}
