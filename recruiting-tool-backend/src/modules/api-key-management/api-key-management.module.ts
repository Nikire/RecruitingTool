import { Module } from '@nestjs/common';
import { ApiKeyManagementController } from './api-key-management.controller';
import { ApiKeyManagementService } from './api-key-management.service';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { ApiKeysModule } from '../../public-api/api-keys/api-keys.module';

@Module({
  imports: [DatabaseModule, ApiKeysModule],
  controllers: [ApiKeyManagementController],
  providers: [ApiKeyManagementService],
})
export class ApiKeyManagementModule {}
