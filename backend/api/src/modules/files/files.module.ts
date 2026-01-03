import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { Attachment } from '../../common/entities';

@Module({
  imports: [MikroOrmModule.forFeature([Attachment])],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
