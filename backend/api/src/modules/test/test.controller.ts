import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { RequirePermissions, Permission } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';

@ApiTags('Test')
@ApiBearerAuth('JWT-auth')
@Controller('test')
export class TestController {
    @Get('admin-only')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Admin only endpoint' })
    @ApiStandardResponse(Object)
    adminOnly(@CurrentUser() user: CurrentUserData) {
        return new StandardResponse({
            message: 'Admin access granted',
            user,
        });
    }

    @Get('dentist-or-admin')
    @Roles(UserRole.DENTIST, UserRole.ADMIN)
    @ApiOperation({ summary: 'Dentist or Admin endpoint' })
    @ApiStandardResponse(Object)
    dentistOrAdmin(@CurrentUser() user: CurrentUserData) {
        return new StandardResponse({
            message: 'Dentist or Admin access granted',
            user,
        });
    }

    @Get('view-revenue')
    @RequirePermissions(Permission.VIEW_REVENUE)
    @ApiOperation({ summary: 'View revenue (permission-based)' })
    @ApiStandardResponse(Object)
    viewRevenue(@CurrentUser() user: CurrentUserData) {
        return new StandardResponse({
            message: 'Revenue access granted',
            user,
        });
    }

    @Get('current-user')
    @ApiOperation({ summary: 'Get current user info' })
    @ApiStandardResponse(Object)
    getCurrentUser(@CurrentUser() user: CurrentUserData) {
        return new StandardResponse(user);
    }
}
