# Prompt 16: Notification Service (Microservice)

## Objective
Create a separate NestJS microservice for processing notifications via AWS SQS, sending WhatsApp messages via WAHA, and emails via Gmail SMTP.

## Context
- Prompts 1-15 completed (main API service)
- Need separate microservice for notifications
- Processes appointment and payment reminders
- Integrates with AWS SQS, WAHA, Gmail

## Prerequisites
- Prompts 1-15 completed
- AWS SQS queue created
- WAHA instance running
- Gmail SMTP credentials

## Setup

### 1. Create New NestJS Project

```bash
cd backend
npx @nestjs/cli new notification-service
cd notification-service
npm install @aws-sdk/client-sqs nodemailer axios
npm install -D @types/nodemailer
```

### 2. Environment Variables

**File: `.env`**
```env
# AWS SQS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/your-account/notifications

# WAHA (WhatsApp)
WAHA_URL=http://localhost:3000
WAHA_SESSION=default

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=DentaCare Pro <your-email@gmail.com>

# Service
PORT=3001
NODE_ENV=development
```

### 3. SQS Consumer

**File: `src/sqs/sqs.consumer.ts`**
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SqsConsumer implements OnModuleInit {
  private sqsClient: SQSClient;
  private queueUrl: string;
  private isPolling = false;

  constructor(
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {
    this.sqsClient = new SQSClient({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    this.queueUrl = this.configService.get('SQS_QUEUE_URL')!;
  }

  onModuleInit() {
    this.startPolling();
  }

  private async startPolling() {
    this.isPolling = true;
    console.log('Started polling SQS queue...');

    while (this.isPolling) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20,
        });

        const response = await this.sqsClient.send(command);

        if (response.Messages) {
          for (const message of response.Messages) {
            await this.processMessage(message);
            
            // Delete message after processing
            await this.sqsClient.send(
              new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: message.ReceiptHandle,
              }),
            );
          }
        }
      } catch (error) {
        console.error('Error polling SQS:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private async processMessage(message: any) {
    try {
      const body = JSON.parse(message.Body);
      console.log('Processing notification:', body);

      switch (body.type) {
        case 'appointment_reminder':
          await this.notificationsService.sendAppointmentReminder(body.data);
          break;
        case 'payment_reminder':
          await this.notificationsService.sendPaymentReminder(body.data);
          break;
        default:
          console.warn('Unknown notification type:', body.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }
}
```

### 4. WhatsApp Service (WAHA)

**File: `src/whatsapp/whatsapp.service.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WhatsAppService {
  private wahaUrl: string;
  private session: string;

  constructor(private configService: ConfigService) {
    this.wahaUrl = this.configService.get('WAHA_URL')!;
    this.session = this.configService.get('WAHA_SESSION')!;
  }

  async sendMessage(phoneNumber: string, message: string) {
    try {
      const response = await axios.post(
        `${this.wahaUrl}/api/sendText`,
        {
          session: this.session,
          chatId: `${phoneNumber}@c.us`,
          text: message,
        },
      );

      console.log('WhatsApp message sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }
}
```

### 5. Email Service

**File: `src/email/email.service.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to,
        subject,
        html,
      });

      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
```

### 6. Notifications Service

**File: `src/notifications/notifications.service.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class NotificationsService {
  constructor(
    private whatsappService: WhatsAppService,
    private emailService: EmailService,
  ) {}

  async sendAppointmentReminder(data: any) {
    const { patient, appointment, settings } = data;

    const message = settings.appointmentReminder.messageTemplate
      .replace('{patientName}', `${patient.firstName} ${patient.lastName}`)
      .replace('{date}', appointment.date)
      .replace('{time}', appointment.time)
      .replace('{drName}', appointment.drName);

    // Send WhatsApp
    if (patient.mobileNumber) {
      await this.whatsappService.sendMessage(patient.mobileNumber, message);
    }

    // Send Email
    if (patient.email) {
      await this.emailService.sendEmail(
        patient.email,
        'Appointment Reminder',
        `<p>${message}</p>`,
      );
    }
  }

  async sendPaymentReminder(data: any) {
    const { patient, treatment, settings } = data;

    if (!patient.enablePaymentReminders) {
      return; // Skip if patient disabled reminders
    }

    const balance = treatment.totalPrice - treatment.amountPaid;

    const message = settings.paymentReminder.messageTemplate
      .replace('{patientName}', `${patient.firstName} ${patient.lastName}`)
      .replace('{balance}', balance.toString());

    // Send WhatsApp
    if (patient.mobileNumber) {
      await this.whatsappService.sendMessage(patient.mobileNumber, message);
    }

    // Send Email
    if (patient.email) {
      await this.emailService.sendEmail(
        patient.email,
        'Payment Reminder',
        `<p>${message}</p>`,
      );
    }
  }
}
```

## Main API Integration

In your main API service, add SQS message sending:

**File: `src/modules/notifications/notifications-queue.service.ts`** (in main API)
```typescript
import { Injectable } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsQueueService {
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor(private configService: ConfigService) {
    this.sqsClient = new SQSClient({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    this.queueUrl = this.configService.get('SQS_QUEUE_URL')!;
  }

  async sendAppointmentReminder(appointmentId: string) {
    // Fetch appointment, patient, settings
    // Send to SQS
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify({
          type: 'appointment_reminder',
          data: { /* appointment, patient, settings */ },
        }),
      }),
    );
  }
}
```

## Acceptance Criteria
- [ ] Notification service created
- [ ] SQS consumer working
- [ ] WhatsApp integration (WAHA)
- [ ] Email integration (Gmail)
- [ ] Appointment reminders
- [ ] Payment reminders
- [ ] Message templates
- [ ] Error handling

## Next Steps
Proceed to **Prompt 17: Swagger Client Generation**

---
**Estimated Time**: 90-120 minutes
**Difficulty**: High
**Dependencies**: Prompts 1-15
