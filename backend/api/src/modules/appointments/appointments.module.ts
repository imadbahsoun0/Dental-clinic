import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import {
  Appointment,
  Patient,
  TreatmentType,
  User,
} from '../../common/entities';

@Module({
  imports: [
    MikroOrmModule.forFeature([Appointment, Patient, TreatmentType, User]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
