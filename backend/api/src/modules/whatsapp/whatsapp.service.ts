import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendWhatsAppMessageParams {
  phoneNumber: string;
  message: string;
}

export interface WhatsAppResponse {
  success: boolean;
  error?: string;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly wahaApiUrl: string;
  private readonly wahaApiKey: string;
  private readonly wahaSession: string;

  constructor(private readonly configService: ConfigService) {
    this.wahaApiUrl = this.configService.get<string>('WAHA_API_URL', 'http://localhost:3002');
    this.wahaApiKey = this.configService.get<string>('WAHA_API_KEY', '');
    this.wahaSession = this.configService.get<string>('WAHA_SESSION', 'default');
  }

  /**
   * Format phone number to WhatsApp chat ID format
   * @param phoneNumber - Phone number (e.g., "96181261368")
   * @returns Formatted chat ID (e.g., "96181261368@c.us")
   */
  private formatChatId(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return `${cleanNumber}@c.us`;
  }

  /**
   * Send WhatsApp message via WAHA API
   * @param params - Phone number and message content
   * @returns Success status and error if any
   */
  async sendMessage(params: SendWhatsAppMessageParams): Promise<WhatsAppResponse> {
    const { phoneNumber, message } = params;

    try {
      const chatId = this.formatChatId(phoneNumber);
      
      this.logger.log(`Sending WhatsApp message to ${chatId}`);

      const response = await fetch(`${this.wahaApiUrl}/api/sendText`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'X-Api-Key': this.wahaApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          text: message,
          session: this.wahaSession,
          reply_to: null,
          linkPreview: true,
          linkPreviewHighQuality: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`WAHA API error: ${response.status} - ${errorText}`);
        return {
          success: false,
          error: `WAHA API error: ${response.status} - ${errorText}`,
        };
      }

      const result = await response.json();
      this.logger.log(`WhatsApp message sent successfully to ${chatId}`);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send WhatsApp message: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if WAHA service is configured
   * @returns True if API URL and API key are set
   */
  isConfigured(): boolean {
    return !!(this.wahaApiUrl && this.wahaApiKey);
  }
}
