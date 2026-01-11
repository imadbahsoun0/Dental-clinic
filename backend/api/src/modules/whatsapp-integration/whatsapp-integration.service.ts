import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { OrganizationVariablesService } from '../organization-variables/organization-variables.service';
import { OrganizationVariableKey } from '../../common/entities/organization-variable.entity';
import type { WahaSessionStatus } from './dto/whatsapp-integration-status.dto';

interface WahaSession {
  name: string;
  status: WahaSessionStatus;
}

interface CreateWahaSessionRequest {
  name: string;
  start: boolean;
}

@Injectable()
export class WhatsappIntegrationService {
  constructor(
    private readonly orgVars: OrganizationVariablesService,
  ) {}

  private normalizeBaseUrl(url: string): string {
    return url.replace(/\/+$/, '');
  }

  private getSessionName(): string {
    return 'default';
  }

  async getConfig(orgId: string): Promise<{ wahaApiUrl?: string; hasApiKey: boolean }> {
    const { [OrganizationVariableKey.WAHA_API_URL]: wahaApiUrl, [OrganizationVariableKey.WAHA_API_KEY]: wahaApiKey } =
      await this.orgVars.getMany(orgId, [
        OrganizationVariableKey.WAHA_API_URL,
        OrganizationVariableKey.WAHA_API_KEY,
      ]);

    return {
      wahaApiUrl,
      hasApiKey: !!wahaApiKey,
    };
  }

  async updateConfig(
    orgId: string,
    dto: { wahaApiUrl?: string; wahaApiKey?: string },
    updatedBy: string,
  ): Promise<{ wahaApiUrl?: string; hasApiKey: boolean }> {
    if (dto.wahaApiUrl !== undefined) {
      await this.orgVars.setValue(
        orgId,
        OrganizationVariableKey.WAHA_API_URL,
        dto.wahaApiUrl,
        updatedBy,
      );
    }

    if (dto.wahaApiKey !== undefined) {
      await this.orgVars.setValue(
        orgId,
        OrganizationVariableKey.WAHA_API_KEY,
        dto.wahaApiKey,
        updatedBy,
      );
    }

    return this.getConfig(orgId);
  }

  private async getWahaAuth(orgId: string): Promise<{ baseUrl: string; apiKey: string }> {
    const { [OrganizationVariableKey.WAHA_API_URL]: rawUrl, [OrganizationVariableKey.WAHA_API_KEY]: apiKey } =
      await this.orgVars.getMany(orgId, [
        OrganizationVariableKey.WAHA_API_URL,
        OrganizationVariableKey.WAHA_API_KEY,
      ]);

    if (!rawUrl || !apiKey) {
      throw new BadRequestException('WhatsApp integration is not configured for this organization');
    }

    return { baseUrl: this.normalizeBaseUrl(rawUrl), apiKey };
  }

  private async listSessions(
    baseUrl: string,
    apiKey: string,
  ): Promise<WahaSession[]> {
    const response = await fetch(`${baseUrl}/api/sessions`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new InternalServerErrorException(
        `WAHA API error: ${response.status} - ${errorText}`,
      );
    }

    const sessions = (await response.json()) as unknown;
    if (!Array.isArray(sessions)) {
      throw new InternalServerErrorException('WAHA returned invalid sessions response');
    }

    return sessions as WahaSession[];
  }

  private async ensureDefaultSessionExists(
    baseUrl: string,
    apiKey: string,
  ): Promise<WahaSession[]> {
    const sessions = await this.listSessions(baseUrl, apiKey);
    if (sessions.length > 0) return sessions;

    const sessionName = this.getSessionName();

    const createBody: CreateWahaSessionRequest = {
      name: sessionName,
      start: true,
    };

    const createResponse = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createBody),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new InternalServerErrorException(
        `WAHA create session error: ${createResponse.status} - ${errorText}`,
      );
    }

    // Re-fetch sessions after creation
    return this.listSessions(baseUrl, apiKey);
  }

  async getStatus(orgId: string): Promise<{ status: WahaSessionStatus; isConnected: boolean; needsQrScan: boolean }> {
    const { baseUrl, apiKey } = await this.getWahaAuth(orgId);

    const sessions = await this.ensureDefaultSessionExists(baseUrl, apiKey);
    if (sessions.length === 0) {
      throw new InternalServerErrorException('WAHA returned no sessions after creation attempt');
    }

    const first = sessions[0] as Partial<WahaSession>;
    const status = first.status;

    if (!status) {
      throw new InternalServerErrorException('WAHA session status missing');
    }

    const isConnected = status === 'WORKING';
    const needsQrScan = status === 'SCAN_QR_CODE';

    return { status, isConnected, needsQrScan };
  }

  private async getFirstSessionName(orgId: string): Promise<string> {
    const { baseUrl, apiKey } = await this.getWahaAuth(orgId);

    const sessions = await this.ensureDefaultSessionExists(baseUrl, apiKey);
    const first = sessions[0] as Partial<WahaSession>;
    if (!first.name) {
      // Fall back to env session if WAHA doesn't include the name
      return this.getSessionName();
    }

    return first.name;
  }

  async getQrPng(orgId: string): Promise<Uint8Array> {
    const status = await this.getStatus(orgId);

    if (!status.needsQrScan) {
      throw new BadRequestException(
        status.isConnected
          ? 'WhatsApp is already connected'
          : 'WhatsApp is not ready for QR scan. Please contact the administrator.',
      );
    }

    const { baseUrl, apiKey } = await this.getWahaAuth(orgId);
    const sessionName = await this.getFirstSessionName(orgId);

    // WAHA QR endpoint (binary image)
    const response = await fetch(`${baseUrl}/api/${encodeURIComponent(sessionName)}/auth/qr`, {
      method: 'GET',
      headers: {
        accept: 'image/png',
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new InternalServerErrorException(
        `WAHA QR API error: ${response.status} - ${errorText}`,
      );
    }

    const arrayBuf = await response.arrayBuffer();
    return new Uint8Array(arrayBuf);
  }

  async deleteFirstSession(orgId: string): Promise<void> {
    const { baseUrl, apiKey } = await this.getWahaAuth(orgId);
    const sessions = await this.listSessions(baseUrl, apiKey);
    const sessionName = sessions[0]?.name ?? this.getSessionName();

    const response = await fetch(
      `${baseUrl}/api/sessions/${encodeURIComponent(sessionName)}`,
      {
        method: 'DELETE',
        headers: {
          accept: '*/*',
          'X-Api-Key': apiKey,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new InternalServerErrorException(
        `WAHA delete session error: ${response.status} - ${errorText}`,
      );
    }
  }
}
