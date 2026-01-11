import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OrganizationVariable } from '../../common/entities';
import { OrganizationVariablesService } from './organization-variables.service';

@Module({
  imports: [MikroOrmModule.forFeature([OrganizationVariable])],
  providers: [OrganizationVariablesService],
  exports: [OrganizationVariablesService],
})
export class OrganizationVariablesModule {}
