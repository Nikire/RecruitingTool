import { Module } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AdminUserService],
})
export class AdminUserModule {}
