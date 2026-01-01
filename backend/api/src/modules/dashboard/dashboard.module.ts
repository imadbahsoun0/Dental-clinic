import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Appointment, Patient, Treatment, Payment, Expense } from '../../common/entities';
import { TreatmentsModule } from '../treatments/treatments.module';

@Module({
    imports: [
        MikroOrmModule.forFeature([Appointment, Patient, Treatment, Payment, Expense]),
        TreatmentsModule,
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule { }
