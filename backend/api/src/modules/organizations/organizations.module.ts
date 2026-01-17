import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { Organization, UserOrganization } from '../../common/entities';
import { FilesModule } from '../files/files.module';
import { OrganizationVariablesModule } from '../organization-variables/organization-variables.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Organization, UserOrganization]),
    FilesModule,
    OrganizationVariablesModule,
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
