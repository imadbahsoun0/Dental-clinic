import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TreatmentTypesController } from './treatment-types.controller';
import { TreatmentTypesService } from './treatment-types.service';
import { TreatmentCategory } from '../../common/entities/treatment-category.entity';
import { TreatmentType } from '../../common/entities/treatment-type.entity';

@Module({
  imports: [MikroOrmModule.forFeature([TreatmentCategory, TreatmentType])],
  controllers: [TreatmentTypesController],
  providers: [TreatmentTypesService],
  exports: [TreatmentTypesService],
})
export class TreatmentTypesModule {}
