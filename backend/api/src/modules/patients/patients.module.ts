import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { Patient, Attachment } from '../../common/entities';
import { FilesModule } from '../files/files.module';

@Module({
    imports: [
        MikroOrmModule.forFeature([Patient, Attachment]),
        FilesModule,
    ],
    controllers: [PatientsController],
    providers: [PatientsService],
    exports: [PatientsService],
})
export class PatientsModule { }
