import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ReminderService } from './reminder.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { MessagesModule } from '../messages/messages.module';
import { NotificationSettingsModule } from '../notification-settings/notification-settings.module';
import {
  Patient,
  Organization,
  User,
  Appointment,
  Payment,
} from '../../common/entities';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Patient,
      Organization,
      User,
      Appointment,
      Payment,
    ]),
    WhatsappModule,
    MessagesModule,
    NotificationSettingsModule,
  ],
  providers: [ReminderService],
  exports: [ReminderService],
})
export class RemindersModule {}
