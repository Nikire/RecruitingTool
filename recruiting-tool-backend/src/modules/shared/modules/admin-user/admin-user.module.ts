import { Module } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { UsersModule } from 'src/modules/users/users.module';
import { EmailTemplatesModule } from 'src/modules/email-templates/email-templates.module';

@Module({
  imports: [UsersModule, EmailTemplatesModule],
  providers: [AdminUserService],
})
export class AdminUserModule {}
