import { Module } from '@nestjs/common';
import { ContactMessagesController } from './contact-messages.controller';
import { ContactMessagesService } from './contact-messages.service';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [DatabaseModule, EmailModule],
  controllers: [ContactMessagesController],
  providers: [ContactMessagesService],
  exports: [ContactMessagesService],
})
export class ContactMessagesModule {}
