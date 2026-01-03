import { Migration } from '@mikro-orm/migrations';

export class Migration20260101132727 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "patients" add column "emergency_contact" varchar(50) null, add column "blood_type" varchar(10) null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "patients" drop column "emergency_contact", drop column "blood_type";`,
    );
  }
}
