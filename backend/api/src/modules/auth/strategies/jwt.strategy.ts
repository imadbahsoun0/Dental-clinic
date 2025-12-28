import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { CurrentUserData } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: any) => {
                    return request?.cookies?.access_token;
                },
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('jwt.accessSecret')!,
        });
    }

    async validate(payload: JwtPayload): Promise<CurrentUserData> {
        // For intermediate tokens (during login/org selection), orgId and role might be missing.
        // We should allow this, but the endpoints requiring full auth (protected routes) should probably check for orgId.
        // However, the standard Guard just calls this. We can return partial data.

        if (!payload.sub) {
            throw new UnauthorizedException('Invalid token payload');
        }

        // If orgId is missing, this is an intermediate session
        return {
            id: payload.sub,
            email: payload.email,
            role: (payload.role || 'guest') as any,
            orgId: payload.orgId || '',
        };
    }
}
