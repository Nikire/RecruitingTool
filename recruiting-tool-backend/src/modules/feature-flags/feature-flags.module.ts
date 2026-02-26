import { Module } from '@nestjs/common';
import { FeatureFlagsController } from './feature-flags.controller';
import { FeatureFlagsService } from './feature-flags.service';
import { DatabaseModule } from '../shared/modules/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FeatureFlagsController],
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
