import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserOrganization } from '../../common/entities';
import { EmailModule } from '../email/email.module';
import jwtConfig from '../../config/jwt.config';

@Module({
    imports: [
        ConfigModule.forFeature(jwtConfig),
        PassportModule,
        JwtModule.register({}), // Configuration done in service
        MikroOrmModule.forFeature([User, UserOrganization]),
        EmailModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule { }
