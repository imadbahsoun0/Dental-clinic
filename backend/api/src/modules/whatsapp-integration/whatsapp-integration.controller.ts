import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';
import { WhatsappIntegrationService } from './whatsapp-integration.service';
import { WhatsappIntegrationConfigDto } from './dto/whatsapp-integration-config.dto';
import { UpdateWhatsappIntegrationDto } from './dto/update-whatsapp-integration.dto';
import { WhatsappIntegrationStatusDto } from './dto/whatsapp-integration-status.dto';

@ApiTags('WhatsApp Integration')
@ApiBearerAuth('JWT-auth')
@Controller('whatsapp-integration')
@Roles(UserRole.ADMIN)
export class WhatsappIntegrationController {
  constructor(private readonly service: WhatsappIntegrationService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get WhatsApp (WAHA) config for current organization' })
  @ApiStandardResponse(WhatsappIntegrationConfigDto)
  async getConfig(@CurrentUser() user: CurrentUserData) {
    const result = await this.service.getConfig(user.orgId);
    return new StandardResponse(result);
  }

  @Patch('config')
  @ApiOperation({ summary: 'Update WhatsApp (WAHA) config for current organization' })
  @ApiStandardResponse(WhatsappIntegrationConfigDto)
  async updateConfig(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateWhatsappIntegrationDto,
  ) {
    const result = await this.service.updateConfig(user.orgId, dto, user.id);
    return new StandardResponse(result, 'WhatsApp integration updated successfully');
  }

  @Get('status')
  @ApiOperation({ summary: 'Get WhatsApp connection status for current organization' })
  @ApiStandardResponse(WhatsappIntegrationStatusDto)
  async getStatus(@CurrentUser() user: CurrentUserData) {
    const result = await this.service.getStatus(user.orgId);
    return new StandardResponse(result);
  }

  @Get('qr')
  @ApiOperation({ summary: 'Get QR code (PNG) for WAHA session (when SCAN_QR_CODE)' })
  async getQr(@CurrentUser() user: CurrentUserData, @Res() res: Response) {
    const pngBytes = await this.service.getQrPng(user.orgId);
    res.setHeader('Content-Type', 'image/png');
    res.send(Buffer.from(pngBytes));
  }

  @Delete('session')
  @ApiOperation({ summary: 'Delete WhatsApp session (resets connection)' })
  @ApiStandardResponse(Object)
  async deleteSession(@CurrentUser() user: CurrentUserData) {
    await this.service.deleteFirstSession(user.orgId);
    return new StandardResponse(null, 'WhatsApp session deleted successfully');
  }
}
