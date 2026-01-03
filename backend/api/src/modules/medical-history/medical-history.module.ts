import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MedicalHistoryService } from './medical-history.service';
import { MedicalHistoryController } from './medical-history.controller';
import { MedicalHistoryQuestion } from '../../common/entities/medical-history-question.entity';

@Module({
  imports: [MikroOrmModule.forFeature([MedicalHistoryQuestion])],
  controllers: [MedicalHistoryController],
  providers: [MedicalHistoryService],
  exports: [MedicalHistoryService],
})
export class MedicalHistoryModule {}
