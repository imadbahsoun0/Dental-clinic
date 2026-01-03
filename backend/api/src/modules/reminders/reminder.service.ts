import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/core';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { MessagesService } from '../messages/messages.service';
import { NotificationSettingsService } from '../notification-settings/notification-settings.service';
import { Patient, Organization, User, Appointment, Payment } from '../../common/entities';
import { MessageType, MessageStatus } from '../../common/entities/message.entity';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly messagesService: MessagesService,
    private readonly notificationSettingsService: NotificationSettingsService,
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
  }

  /**
   * Replace template variables with actual values
   */
  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
    }
    return result;
  }

  /**
   * Send medical history link to patient after creation
   */
  async sendMedicalHistoryLink(patientId: string, orgId: string): Promise<void> {
    try {
      const patient = await this.em.findOneOrFail(Patient, { id: patientId, orgId });
      const settings = await this.notificationSettingsService.getOrCreateSettings(orgId);
      const org = await this.em.findOneOrFail(Organization, { id: orgId });

      const medicalHistoryLink = `${this.frontendUrl}/medical-history/${patientId}?orgId=${orgId}`;

      const variables = {
        patientName: `${patient.firstName} ${patient.lastName}`,
        medicalHistoryLink,
        clinicName: org.name,
        clinicLocation: org.location || org.name,
      };

      const content = this.replaceVariables(
        settings.messageTemplates.medical_history,
        variables,
      );

      // Create message record
      const message = await this.messagesService.create(
        {
          patientId,
          type: MessageType.MEDICAL_HISTORY,
          content,
          metadata: { medicalHistoryLink },
        },
        orgId,
      );

      // Send WhatsApp message
      const result = await this.whatsappService.sendMessage({
        phoneNumber: patient.mobileNumber,
        message: content,
      });

      // Update message status
      await this.messagesService.updateStatus(
        message.id,
        result.success ? MessageStatus.SENT : MessageStatus.FAILED,
        result.error,
      );

      if (result.success) {
        this.logger.log(`Medical history link sent to patient ${patientId}`);
      } else {
        this.logger.error(`Failed to send medical history link: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending medical history link: ${error}`);
      throw error;
    }
  }

  /**
   * Send payment receipt to patient
   */
  async sendPaymentReceipt(
    patientId: string,
    paymentId: string,
    amount: number,
    remainingBalance: number,
    orgId: string,
  ): Promise<void> {
    try {
      const patient = await this.em.findOneOrFail(Patient, { id: patientId, orgId });
      const settings = await this.notificationSettingsService.getOrCreateSettings(orgId);
      const org = await this.em.findOneOrFail(Organization, { id: orgId });

      const variables = {
        patientName: `${patient.firstName} ${patient.lastName}`,
        amount: amount.toFixed(2),
        remainingBalance: remainingBalance.toFixed(2),
        clinicName: org.name,
        clinicLocation: org.location || org.name,
      };

      const content = this.replaceVariables(
        settings.messageTemplates.payment_receipt,
        variables,
      );

      // Create message record
      const message = await this.messagesService.create(
        {
          patientId,
          type: MessageType.PAYMENT_RECEIPT,
          content,
          metadata: { paymentId, amount, remainingBalance },
        },
        orgId,
      );

      // Send WhatsApp message
      const result = await this.whatsappService.sendMessage({
        phoneNumber: patient.mobileNumber,
        message: content,
      });

      // Update message status
      await this.messagesService.updateStatus(
        message.id,
        result.success ? MessageStatus.SENT : MessageStatus.FAILED,
        result.error,
      );

      if (result.success) {
        this.logger.log(`Payment receipt sent to patient ${patientId}`);
      } else {
        this.logger.error(`Failed to send payment receipt: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending payment receipt: ${error}`);
      throw error;
    }
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(appointmentId: string, orgId: string, timingInHours?: number): Promise<void> {
    try {
      const appointment = await this.em.findOneOrFail(
        Appointment,
        { id: appointmentId, orgId },
        { populate: ['patient', 'doctor'] },
      );

      const settings = await this.notificationSettingsService.getOrCreateSettings(orgId);
      const org = await this.em.findOneOrFail(Organization, { id: orgId });

      const appointmentDate = appointment.date.toISOString().split('T')[0];
      const doctor = appointment.doctor
      const doctorName = doctor
        ? `${doctor.name}`
        : 'the doctor';

      const variables = {
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        appointmentDate,
        appointmentTime: appointment.time,
        doctorName,
        clinicName: org.name,
        clinicLocation: org.location || org.name,
      };

      const content = this.replaceVariables(
        settings.messageTemplates.appointment_reminder,
        variables,
      );

      // Create message record
      const message = await this.messagesService.create(
        {
          patientId: appointment.patient.id,
          type: MessageType.APPOINTMENT_REMINDER,
          content,
          metadata: { 
            appointmentId, 
            appointmentDate, 
            appointmentTime: appointment.time,
            timingInHours 
          },
        },
        orgId,
      );

      // Send WhatsApp message
      const result = await this.whatsappService.sendMessage({
        phoneNumber: appointment.patient.mobileNumber,
        message: content,
      });

      // Update message status
      await this.messagesService.updateStatus(
        message.id,
        result.success ? MessageStatus.SENT : MessageStatus.FAILED,
        result.error,
      );

      if (result.success) {
        this.logger.log(`Appointment reminder sent for appointment ${appointmentId}`);
      } else {
        this.logger.error(`Failed to send appointment reminder: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending appointment reminder: ${error}`);
      throw error;
    }
  }

  /**
   * Send follow-up reminder
   */
  async sendFollowUpReminder(patientId: string, orgId: string): Promise<void> {
    try {
      const patient = await this.em.findOneOrFail(Patient, { id: patientId, orgId });
      const settings = await this.notificationSettingsService.getOrCreateSettings(orgId);
      const org = await this.em.findOneOrFail(Organization, { id: orgId });

      const variables = {
        patientName: `${patient.firstName} ${patient.lastName}`,
        followUpReason: patient.followUpReason || 'Follow-up required',
        clinicName: org.name,
        clinicLocation: org.location || org.name,
      };

      const content = this.replaceVariables(
        settings.messageTemplates.follow_up,
        variables,
      );

      // Create message record
      const message = await this.messagesService.create(
        {
          patientId,
          type: MessageType.FOLLOW_UP,
          content,
          metadata: { followUpDate: patient.followUpDate, followUpReason: patient.followUpReason },
        },
        orgId,
      );

      // Send WhatsApp message
      const result = await this.whatsappService.sendMessage({
        phoneNumber: patient.mobileNumber,
        message: content,
      });

      // Update message status
      await this.messagesService.updateStatus(
        message.id,
        result.success ? MessageStatus.SENT : MessageStatus.FAILED,
        result.error,
      );

      if (result.success) {
        this.logger.log(`Follow-up reminder sent to patient ${patientId}`);
      } else {
        this.logger.error(`Failed to send follow-up reminder: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending follow-up reminder: ${error}`);
      throw error;
    }
  }

  /**
   * Send payment overdue reminder
   */
  async sendPaymentOverdueReminder(
    patientId: string,
    amountDue: number,
    orgId: string,
  ): Promise<void> {
    try {
      const patient = await this.em.findOneOrFail(Patient, { id: patientId, orgId });
      const settings = await this.notificationSettingsService.getOrCreateSettings(orgId);
      const org = await this.em.findOneOrFail(Organization, { id: orgId });

      const variables = {
        patientName: `${patient.firstName} ${patient.lastName}`,
        amountDue: amountDue.toFixed(2),
        clinicName: org.name,
        clinicLocation: org.location || org.name,
      };

      const content = this.replaceVariables(
        settings.messageTemplates.payment_overdue,
        variables,
      );

      // Create message record
      const message = await this.messagesService.create(
        {
          patientId,
          type: MessageType.PAYMENT_OVERDUE,
          content,
          metadata: { amountDue },
        },
        orgId,
      );

      // Send WhatsApp message
      const result = await this.whatsappService.sendMessage({
        phoneNumber: patient.mobileNumber,
        message: content,
      });

      // Update message status
      await this.messagesService.updateStatus(
        message.id,
        result.success ? MessageStatus.SENT : MessageStatus.FAILED,
        result.error,
      );

      if (result.success) {
        this.logger.log(`Payment overdue reminder sent to patient ${patientId}`);
      } else {
        this.logger.error(`Failed to send payment overdue reminder: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending payment overdue reminder: ${error}`);
      throw error;
    }
  }

  /**
   * Resend a failed message
   */
  async resendMessage(messageId: string, orgId: string): Promise<void> {
    try {
      const message = await this.messagesService.findOne(messageId, orgId);
      const patient = await this.em.findOneOrFail(Patient, { id: message.patient.id });

      // Send WhatsApp message
      const result = await this.whatsappService.sendMessage({
        phoneNumber: patient.mobileNumber,
        message: message.content,
      });

      // Update message status
      await this.messagesService.updateStatus(
        messageId,
        result.success ? MessageStatus.SENT : MessageStatus.FAILED,
        result.error,
      );

      if (result.success) {
        this.logger.log(`Message ${messageId} resent successfully`);
      } else {
        this.logger.error(`Failed to resend message: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Error resending message: ${error}`);
      throw error;
    }
  }
}
