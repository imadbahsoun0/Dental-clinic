import { Migration } from '@mikro-orm/migrations';

export class Migration20251227210605_initial_schema extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "attachments" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "filename" varchar(255) not null, "s3key" varchar(1024) not null, "bucket" varchar(255) not null, "mime_type" varchar(255) not null, "size" int not null, constraint "attachments_pkey" primary key ("id"));`);
    this.addSql(`create index "attachments_org_id_index" on "attachments" ("org_id");`);

    this.addSql(`create table "medical_history_questions" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "question" text not null, "type" text check ("type" in ('text', 'radio', 'checkbox', 'textarea')) not null, "options" jsonb null, "required" boolean not null default false, "order" int not null, constraint "medical_history_questions_pkey" primary key ("id"));`);
    this.addSql(`create index "medical_history_questions_org_id_index" on "medical_history_questions" ("org_id");`);

    this.addSql(`create table "notification_settings" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "appointment_reminder" jsonb not null, "payment_reminder" jsonb not null, constraint "notification_settings_pkey" primary key ("id"));`);
    this.addSql(`alter table "notification_settings" add constraint "notification_settings_org_id_unique" unique ("org_id");`);

    this.addSql(`create table "organizations" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "name" varchar(255) not null, "location" text null, "phone" varchar(50) null, "email" varchar(255) null, "website" varchar(255) null, "logo" text null, "is_active" boolean not null default true, constraint "organizations_pkey" primary key ("id"));`);

    this.addSql(`create table "patients" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "mobile_number" varchar(50) not null, "email" varchar(255) null, "date_of_birth" date null, "address" text null, "medical_history" jsonb null, "enable_payment_reminders" boolean not null default true, constraint "patients_pkey" primary key ("id"));`);
    this.addSql(`create index "patients_email_org_id_index" on "patients" ("email", "org_id");`);
    this.addSql(`create index "patients_mobile_number_org_id_index" on "patients" ("mobile_number", "org_id");`);
    this.addSql(`create index "patients_org_id_index" on "patients" ("org_id");`);

    this.addSql(`create table "patients_documents" ("patient_id" uuid not null, "attachment_id" uuid not null, constraint "patients_documents_pkey" primary key ("patient_id", "attachment_id"));`);

    this.addSql(`create table "payments" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "patient_id" uuid not null, "amount" numeric(10,2) not null, "date" date not null, "payment_method" text check ("payment_method" in ('cash', 'card', 'transfer', 'check', 'other')) not null, "notes" text null, constraint "payments_pkey" primary key ("id"));`);
    this.addSql(`create index "payments_date_org_id_index" on "payments" ("date", "org_id");`);
    this.addSql(`create index "payments_patient_id_org_id_index" on "payments" ("patient_id", "org_id");`);
    this.addSql(`create index "payments_org_id_index" on "payments" ("org_id");`);

    this.addSql(`create table "teeth" ("number" int not null, "name" varchar(255) not null, constraint "teeth_pkey" primary key ("number"));`);

    this.addSql(`create table "treatment_categories" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "name" varchar(255) not null, "icon" varchar(10) not null, "order" int not null, constraint "treatment_categories_pkey" primary key ("id"));`);
    this.addSql(`create index "treatment_categories_org_id_index" on "treatment_categories" ("org_id");`);

    this.addSql(`create table "treatment_types" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "name" varchar(255) not null, "category_id" uuid null, "price_variants" jsonb not null, "duration" int not null, "color" varchar(7) not null, constraint "treatment_types_pkey" primary key ("id"));`);
    this.addSql(`create index "treatment_types_org_id_index" on "treatment_types" ("org_id");`);

    this.addSql(`create table "users" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "name" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "phone" varchar(50) null, "refresh_token" text null, "refresh_token_expires_at" timestamptz null, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`create table "expenses" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "name" varchar(255) not null, "amount" numeric(10,2) not null, "date" date not null, "invoice_id" uuid null, "notes" text null, "doctor_id" uuid null, "expense_type" text check ("expense_type" in ('lab', 'equipment', 'utilities', 'rent', 'salary', 'doctor_payment', 'other')) not null default 'other', constraint "expenses_pkey" primary key ("id"));`);
    this.addSql(`alter table "expenses" add constraint "expenses_invoice_id_unique" unique ("invoice_id");`);
    this.addSql(`create index "expenses_doctor_id_org_id_index" on "expenses" ("doctor_id", "org_id");`);
    this.addSql(`create index "expenses_date_org_id_index" on "expenses" ("date", "org_id");`);
    this.addSql(`create index "expenses_org_id_index" on "expenses" ("org_id");`);

    this.addSql(`create table "appointments" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "patient_id" uuid not null, "treatment_type_id" uuid not null, "date" date not null, "time" time(0) not null, "status" text check ("status" in ('confirmed', 'pending', 'cancelled')) not null default 'pending', "doctor_id" uuid null, "notes" text null, constraint "appointments_pkey" primary key ("id"));`);
    this.addSql(`create index "appointments_patient_id_org_id_index" on "appointments" ("patient_id", "org_id");`);
    this.addSql(`create index "appointments_date_org_id_index" on "appointments" ("date", "org_id");`);
    this.addSql(`create index "appointments_org_id_index" on "appointments" ("org_id");`);

    this.addSql(`create table "treatments" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "patient_id" uuid not null, "treatment_type_id" uuid not null, "appointment_id" uuid null, "total_price" numeric(10,2) not null, "discount" numeric(10,2) not null default 0, "status" text check ("status" in ('planned', 'in-progress', 'completed', 'cancelled')) not null default 'planned', "notes" text null, constraint "treatments_pkey" primary key ("id"));`);
    this.addSql(`create index "treatments_status_org_id_index" on "treatments" ("status", "org_id");`);
    this.addSql(`create index "treatments_patient_id_org_id_index" on "treatments" ("patient_id", "org_id");`);
    this.addSql(`create index "treatments_org_id_index" on "treatments" ("org_id");`);

    this.addSql(`create table "treatments_teeth" ("treatment_id" uuid not null, "tooth_number" int not null, constraint "treatments_teeth_pkey" primary key ("treatment_id", "tooth_number"));`);

    this.addSql(`create table "user_organizations" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "user_id" uuid not null, "organization_id" uuid not null, "role" text check ("role" in ('admin', 'dentist', 'secretary')) not null, "status" text check ("status" in ('active', 'inactive')) not null default 'active', "wallet" numeric(10,2) null, "percentage" int null, constraint "user_organizations_pkey" primary key ("id"));`);
    this.addSql(`create index "user_organizations_org_id_index" on "user_organizations" ("org_id");`);
    this.addSql(`alter table "user_organizations" add constraint "user_organizations_user_id_org_id_unique" unique ("user_id", "org_id");`);

    this.addSql(`alter table "patients_documents" add constraint "patients_documents_patient_id_foreign" foreign key ("patient_id") references "patients" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "patients_documents" add constraint "patients_documents_attachment_id_foreign" foreign key ("attachment_id") references "attachments" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "payments" add constraint "payments_patient_id_foreign" foreign key ("patient_id") references "patients" ("id") on update cascade;`);

    this.addSql(`alter table "treatment_types" add constraint "treatment_types_category_id_foreign" foreign key ("category_id") references "treatment_categories" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "expenses" add constraint "expenses_invoice_id_foreign" foreign key ("invoice_id") references "attachments" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "expenses" add constraint "expenses_doctor_id_foreign" foreign key ("doctor_id") references "users" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "appointments" add constraint "appointments_patient_id_foreign" foreign key ("patient_id") references "patients" ("id") on update cascade;`);
    this.addSql(`alter table "appointments" add constraint "appointments_treatment_type_id_foreign" foreign key ("treatment_type_id") references "treatment_types" ("id") on update cascade;`);
    this.addSql(`alter table "appointments" add constraint "appointments_doctor_id_foreign" foreign key ("doctor_id") references "users" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "treatments" add constraint "treatments_patient_id_foreign" foreign key ("patient_id") references "patients" ("id") on update cascade;`);
    this.addSql(`alter table "treatments" add constraint "treatments_treatment_type_id_foreign" foreign key ("treatment_type_id") references "treatment_types" ("id") on update cascade;`);
    this.addSql(`alter table "treatments" add constraint "treatments_appointment_id_foreign" foreign key ("appointment_id") references "appointments" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "treatments_teeth" add constraint "treatments_teeth_treatment_id_foreign" foreign key ("treatment_id") references "treatments" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "treatments_teeth" add constraint "treatments_teeth_tooth_number_foreign" foreign key ("tooth_number") references "teeth" ("number") on update cascade on delete cascade;`);

    this.addSql(`alter table "user_organizations" add constraint "user_organizations_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);
    this.addSql(`alter table "user_organizations" add constraint "user_organizations_organization_id_foreign" foreign key ("organization_id") references "organizations" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "patients_documents" drop constraint "patients_documents_attachment_id_foreign";`);

    this.addSql(`alter table "expenses" drop constraint "expenses_invoice_id_foreign";`);

    this.addSql(`alter table "user_organizations" drop constraint "user_organizations_organization_id_foreign";`);

    this.addSql(`alter table "patients_documents" drop constraint "patients_documents_patient_id_foreign";`);

    this.addSql(`alter table "payments" drop constraint "payments_patient_id_foreign";`);

    this.addSql(`alter table "appointments" drop constraint "appointments_patient_id_foreign";`);

    this.addSql(`alter table "treatments" drop constraint "treatments_patient_id_foreign";`);

    this.addSql(`alter table "treatments_teeth" drop constraint "treatments_teeth_tooth_number_foreign";`);

    this.addSql(`alter table "treatment_types" drop constraint "treatment_types_category_id_foreign";`);

    this.addSql(`alter table "appointments" drop constraint "appointments_treatment_type_id_foreign";`);

    this.addSql(`alter table "treatments" drop constraint "treatments_treatment_type_id_foreign";`);

    this.addSql(`alter table "expenses" drop constraint "expenses_doctor_id_foreign";`);

    this.addSql(`alter table "appointments" drop constraint "appointments_doctor_id_foreign";`);

    this.addSql(`alter table "user_organizations" drop constraint "user_organizations_user_id_foreign";`);

    this.addSql(`alter table "treatments" drop constraint "treatments_appointment_id_foreign";`);

    this.addSql(`alter table "treatments_teeth" drop constraint "treatments_teeth_treatment_id_foreign";`);

    this.addSql(`drop table if exists "attachments" cascade;`);

    this.addSql(`drop table if exists "medical_history_questions" cascade;`);

    this.addSql(`drop table if exists "notification_settings" cascade;`);

    this.addSql(`drop table if exists "organizations" cascade;`);

    this.addSql(`drop table if exists "patients" cascade;`);

    this.addSql(`drop table if exists "patients_documents" cascade;`);

    this.addSql(`drop table if exists "payments" cascade;`);

    this.addSql(`drop table if exists "teeth" cascade;`);

    this.addSql(`drop table if exists "treatment_categories" cascade;`);

    this.addSql(`drop table if exists "treatment_types" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "expenses" cascade;`);

    this.addSql(`drop table if exists "appointments" cascade;`);

    this.addSql(`drop table if exists "treatments" cascade;`);

    this.addSql(`drop table if exists "treatments_teeth" cascade;`);

    this.addSql(`drop table if exists "user_organizations" cascade;`);
  }

}
