import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SchedulerService } from './scheduler.service';
import { RemindersModule } from '../reminders/reminders.module';
import { NotificationSettingsModule } from '../notification-settings/notification-settings.module';
import { Appointment, Organization, Message } from '../../common/entities';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MikroOrmModule.forFeature([Appointment, Organization, Message]),
    RemindersModule,
    NotificationSettingsModule,
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
