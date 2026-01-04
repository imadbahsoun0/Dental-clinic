import { Migration } from '@mikro-orm/migrations';

export class Migration20260102211712_add_messages_and_follow_ups extends Migration {
  override async up(): Promise<void> {
    // Create messages table
    this.addSql(
      `create table "messages" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "deleted_at" timestamptz null, "deleted_by" uuid null, "patient_id" uuid not null, "type" text check ("type" in ('medical_history', 'payment_receipt', 'appointment_reminder', 'follow_up', 'payment_overdue')) not null, "content" text not null, "status" text check ("status" in ('pending', 'sent', 'failed')) not null default 'pending', "sent_at" timestamptz null, "error" text null, "metadata" jsonb null, constraint "messages_pkey" primary key ("id"));`,
    );

    this.addSql(
      `alter table "messages" add constraint "messages_patient_id_foreign" foreign key ("patient_id") references "patients" ("id") on update cascade;`,
    );

    // Add new columns as nullable first
    this.addSql(
      `alter table "notification_settings" add column "appointment_reminders" jsonb null, add column "message_templates" jsonb null;`,
    );

    // Update existing rows with default values
    this.addSql(`
      update "notification_settings" set 
        "appointment_reminders" = '[{"enabled": true, "timingInHours": 24}, {"enabled": true, "timingInHours": 1}]'::jsonb,
        "message_templates" = '{
          "medical_history": "Hello {{patientName}}, please fill out your medical history form: {{medicalHistoryLink}}",
          "payment_receipt": "Hello {{patientName}}, thank you for your payment of {{amount}}. Your remaining balance is {{remainingBalance}}.",
          "appointment_reminder": "Hello {{patientName}}, this is a reminder for your appointment on {{appointmentDate}} at {{appointmentTime}} with Dr. {{doctorName}} at {{clinicLocation}}.",
          "follow_up": "Hello {{patientName}}, this is a reminder for your follow-up appointment. Reason: {{followUpReason}}. Please contact us at {{clinicLocation}}.",
          "payment_overdue": "Hello {{patientName}}, you have an outstanding balance of {{amountDue}} for completed treatments. Please contact us at {{clinicLocation}} to arrange payment."
        }'::jsonb
      where "appointment_reminders" is null;
    `);

    // Make columns NOT NULL
    this.addSql(
      `alter table "notification_settings" alter column "appointment_reminders" set not null, alter column "message_templates" set not null;`,
    );

    // Drop old columns
    this.addSql(
      `alter table "notification_settings" drop column "appointment_reminder", drop column "payment_reminder";`,
    );

    // Remove enablePaymentReminders from patients
    this.addSql(
      `alter table "patients" drop column "enable_payment_reminders";`,
    );

    // Add follow-up fields to patients
    this.addSql(
      `alter table "patients" add column "follow_up_date" date null, add column "follow_up_reason" text null, add column "follow_up_status" text check ("follow_up_status" in ('pending', 'completed', 'cancelled')) not null default 'pending';`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "messages" cascade;`);

    this.addSql(
      `alter table "notification_settings" drop column "appointment_reminders", drop column "message_templates";`,
    );

    this.addSql(
      `alter table "notification_settings" add column "appointment_reminder" jsonb not null, add column "payment_reminder" jsonb not null;`,
    );

    this.addSql(
      `alter table "patients" drop column "follow_up_date", drop column "follow_up_reason", drop column "follow_up_status";`,
    );

    this.addSql(
      `alter table "patients" add column "enable_payment_reminders" bool not null default true;`,
    );
  }
}
