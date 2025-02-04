import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './modules/shared/shared.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { HiringProcessModule } from './modules/hiring-process/hiring-process.module';
import { StagesModule } from './modules/hiring-process/modules/stages/stages.module';

@Module({
  imports: [UsersModule, SharedModule, ConfigModule.forRoot({ isGlobal: true }), HiringProcessModule, StagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
