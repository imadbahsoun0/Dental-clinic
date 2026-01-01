import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TreatmentsController } from './treatments.controller';
import { TreatmentsService } from './treatments.service';
import { Treatment, Tooth } from '../../common/entities';
import { UserOrganization } from '../../common/entities/user-organization.entity';

@Module({
    imports: [MikroOrmModule.forFeature([Treatment, Tooth, UserOrganization])],
    controllers: [TreatmentsController],
    providers: [TreatmentsService],
    exports: [TreatmentsService],
})
export class TreatmentsModule { }
