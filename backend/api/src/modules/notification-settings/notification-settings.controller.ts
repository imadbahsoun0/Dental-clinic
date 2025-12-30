import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationSettingsService } from './notification-settings.service';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { NotificationSettingsResponseDto } from './dto/notification-settings-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';

@ApiTags('Notification Settings')
@ApiBearerAuth('JWT-auth')
@Controller('notification-settings')
@Roles(UserRole.ADMIN) // Only admins can manage notification settings
export class NotificationSettingsController {
    constructor(private readonly notificationSettingsService: NotificationSettingsService) {}

    @Get()
    @ApiOperation({ summary: 'Get notification settings for the organization' })
    @ApiStandardResponse(NotificationSettingsResponseDto)
    async get(@CurrentUser() user: CurrentUserData) {
        const result = await this.notificationSettingsService.getOrCreateSettings(user.orgId);
        return new StandardResponse(result);
    }

    @Patch()
    @ApiOperation({ summary: 'Update notification settings' })
    @ApiStandardResponse(NotificationSettingsResponseDto)
    async update(
        @Body() updateDto: UpdateNotificationSettingsDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.notificationSettingsService.update(user.orgId, updateDto);
        return new StandardResponse(result, 'Notification settings updated successfully');
    }
}
