import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './modules/shared/shared.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, SharedModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
