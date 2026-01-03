import { Migration } from '@mikro-orm/migrations';

export class Migration20260103184733_CreateMedicalHistoryAuditTable extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "medical_history_audits" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "deleted_at" timestamptz null, "deleted_by" uuid null, "patient_id" uuid not null, "edited_by_id" uuid not null, "previous_data" jsonb not null, "new_data" jsonb not null, "changes" jsonb not null, "notes" text null, constraint "medical_history_audits_pkey" primary key ("id"));`);
    this.addSql(`create index "medical_history_audits_created_at_org_id_index" on "medical_history_audits" ("created_at", "org_id");`);
    this.addSql(`create index "medical_history_audits_edited_by_id_org_id_index" on "medical_history_audits" ("edited_by_id", "org_id");`);
    this.addSql(`create index "medical_history_audits_patient_id_org_id_index" on "medical_history_audits" ("patient_id", "org_id");`);

    this.addSql(`alter table "medical_history_audits" add constraint "medical_history_audits_patient_id_foreign" foreign key ("patient_id") references "patients" ("id") on update cascade;`);
    this.addSql(`alter table "medical_history_audits" add constraint "medical_history_audits_edited_by_id_foreign" foreign key ("edited_by_id") references "users" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "medical_history_audits" cascade;`);
  }

}
