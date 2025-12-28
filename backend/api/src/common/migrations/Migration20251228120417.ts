import { Migration } from '@mikro-orm/migrations';

export class Migration20251228120417 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "users" add column "reset_password_token" text null, add column "reset_password_expires" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "users" drop column "reset_password_token", drop column "reset_password_expires";`);
  }

}
