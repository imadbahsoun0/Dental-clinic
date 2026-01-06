import { Migration } from '@mikro-orm/migrations';

export class Migration20260106192952 extends Migration {

  override async up(): Promise<void> {
    // Add column as nullable first
    this.addSql(`alter table "notification_settings" add column "notification_toggles" jsonb;`);
    
    // Set default value for existing rows
    this.addSql(`update "notification_settings" set "notification_toggles" = '{"medical_history": true, "payment_receipt": true, "follow_up": true, "payment_overdue": true}' where "notification_toggles" is null;`);
    
    // Now make it NOT NULL
    this.addSql(`alter table "notification_settings" alter column "notification_toggles" set not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "notification_settings" drop column "notification_toggles";`);
  }

}
