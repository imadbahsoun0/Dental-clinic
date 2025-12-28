import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CurrentUserData } from '../decorators/current-user.decorator';

/**
 * Guard to ensure user can only access data from their current organization
 * This is automatically applied by checking orgId in queries
 */
@Injectable()
export class OrgScopeGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user: CurrentUserData = request.user;

        if (!user || !user.orgId) {
            throw new ForbiddenException('Organization context not found');
        }

        // Add orgId to request for easy access in services
        request.orgId = user.orgId;

        return true;
    }
}
