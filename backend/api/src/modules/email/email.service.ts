import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);

    constructor(private configService: ConfigService) {
        // log all email configs
        console.log('SMTP_HOST:', this.configService.get('SMTP_HOST'));
        console.log('SMTP_PORT:', this.configService.get('SMTP_PORT'));
        console.log('SMTP_SECURE:', this.configService.get('SMTP_SECURE'));
        console.log('SMTP_USER:', this.configService.get('SMTP_USER'));
        console.log('SMTP_PASS:', this.configService.get('SMTP_PASS'));
        console.log('SMTP_FROM:', this.configService.get('SMTP_FROM'));

        const smtpUser = this.configService.get<string>('SMTP_USER');
        const smtpPass = this.configService.get<string>('SMTP_PASS');

        const transportConfig: any = {
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: this.configService.get<string>('SMTP_SECURE') === 'true', // Handle string 'true' from env
        };

        if (smtpUser && smtpPass) {
            transportConfig.auth = {
                user: smtpUser,
                pass: smtpPass,
            };
        }

        this.transporter = nodemailer.createTransport(transportConfig);
    }

    async sendPasswordResetEmail(to: string, resetToken: string) {
        const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001')}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: this.configService.get<string>('SMTP_FROM', '"DentaCare Pro" <noreply@dentacare.com>'),
            to,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Please click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Password reset email sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error);
            throw new Error('Failed to send email');
        }
    }
}
