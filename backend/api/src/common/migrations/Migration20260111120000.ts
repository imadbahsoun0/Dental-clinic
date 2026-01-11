import { Migration } from '@mikro-orm/migrations';

export class Migration20260111120000 extends Migration {
  override async up(): Promise<void> {
    // If a previous attempt created a dedicated WhatsApp settings table, remove it.
    this.addSql(`drop table if exists "whatsapp_integration_settings" cascade;`);

    this.addSql(
      `create table "organization_variables" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" uuid null, "updated_by" uuid null, "org_id" uuid not null, "deleted_at" timestamptz null, "deleted_by" uuid null, "key" varchar(255) not null, "value" text null, constraint "organization_variables_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "organization_variables_org_id_key_index" on "organization_variables" ("org_id", "key");`,
    );
    this.addSql(
      `alter table "organization_variables" add constraint "organization_variables_org_id_key_unique" unique ("org_id", "key");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "organization_variables" cascade;`);
  }
}
