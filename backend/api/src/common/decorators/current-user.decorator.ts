import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from './roles.decorator';

export interface CurrentUserData {
    id: string;
    email: string;
    role: UserRole;
    orgId: string;
}

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): CurrentUserData => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
