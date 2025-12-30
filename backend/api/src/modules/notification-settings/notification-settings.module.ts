import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsController } from './notification-settings.controller';
import { NotificationSettings } from '../../common/entities/notification-settings.entity';

@Module({
    imports: [MikroOrmModule.forFeature([NotificationSettings])],
    controllers: [NotificationSettingsController],
    providers: [NotificationSettingsService],
    exports: [NotificationSettingsService],
})
export class NotificationSettingsModule {}
