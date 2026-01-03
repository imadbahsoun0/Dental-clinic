import { Migration } from '@mikro-orm/migrations';

export class Migration20260103191500_AddOrganizationTimeZone extends Migration {

  override async up(): Promise<void> {
    this.addSql('alter table "organizations" add column "time_zone" text not null default \'UTC\';');
  }

  override async down(): Promise<void> {
    this.addSql('alter table "organizations" drop column "time_zone";');
  }

}
