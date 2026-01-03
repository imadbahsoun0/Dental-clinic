import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { Patient, Attachment, MedicalHistoryAudit, User } from '../../common/entities';
import { FilesModule } from '../files/files.module';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Patient, Attachment, MedicalHistoryAudit, User]),
    FilesModule,
    RemindersModule,
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
