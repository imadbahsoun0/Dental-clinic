import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserOrganization } from '../../common/entities';

import { EmailModule } from '../email/email.module';

@Module({
    imports: [
        MikroOrmModule.forFeature([User, UserOrganization]),
        EmailModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
