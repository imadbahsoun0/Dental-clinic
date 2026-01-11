import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsappIntegrationController } from './whatsapp-integration.controller';
import { WhatsappIntegrationService } from './whatsapp-integration.service';
import { OrganizationVariablesModule } from '../organization-variables/organization-variables.module';

@Module({
  imports: [ConfigModule, OrganizationVariablesModule],
  controllers: [WhatsappIntegrationController],
  providers: [WhatsappIntegrationService],
})
export class WhatsappIntegrationModule {}
