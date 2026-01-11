import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { OrganizationVariablesModule } from '../organization-variables/organization-variables.module';

@Module({
  imports: [OrganizationVariablesModule],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
