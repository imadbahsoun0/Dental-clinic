import { Migration } from '@mikro-orm/migrations';

export class Migration20260101131418 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "medical_history_questions" drop constraint if exists "medical_history_questions_type_check";`,
    );

    this.addSql(
      `alter table "appointments" drop constraint "appointments_treatment_type_id_foreign";`,
    );

    this.addSql(
      `alter table "medical_history_questions" add column "text_trigger_option" text null, add column "text_field_label" text null;`,
    );
    this.addSql(
      `alter table "medical_history_questions" add constraint "medical_history_questions_type_check" check("type" in ('text', 'radio', 'checkbox', 'textarea', 'radio_with_text'));`,
    );

    this.addSql(
      `alter table "appointments" add constraint "appointments_treatment_type_id_foreign" foreign key ("treatment_type_id") references "treatment_types" ("id") on update cascade on delete set null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "appointments" drop constraint "appointments_treatment_type_id_foreign";`,
    );

    this.addSql(
      `alter table "medical_history_questions" drop constraint if exists "medical_history_questions_type_check";`,
    );

    this.addSql(
      `alter table "appointments" add constraint "appointments_treatment_type_id_foreign" foreign key ("treatment_type_id") references "treatment_types" ("id") on update cascade on delete no action;`,
    );

    this.addSql(
      `alter table "medical_history_questions" drop column "text_trigger_option", drop column "text_field_label";`,
    );

    this.addSql(
      `alter table "medical_history_questions" add constraint "medical_history_questions_type_check" check("type" in ('text', 'radio', 'checkbox', 'textarea'));`,
    );
  }
}
