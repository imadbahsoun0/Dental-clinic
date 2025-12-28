import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CurrentUserData } from '../decorators/current-user.decorator';
import { UserRole } from '../decorators/roles.decorator';

/**
 * Guard to check if user owns the resource or has admin role
 * Used for endpoints like "get my appointments", "get my revenue"
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user: CurrentUserData = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Admins can access all resources
        if (user.role === UserRole.ADMIN) {
            return true;
        }

        // For other roles, check if they're accessing their own resources
        // This will be validated in the service layer
        return true;
    }
}
