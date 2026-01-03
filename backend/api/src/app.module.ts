import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mikroOrmConfig from './common/config/mikro-orm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmailModule } from './modules/email/email.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { TestModule } from './modules/test/test.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { FilesModule } from './modules/files/files.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TreatmentTypesModule } from './modules/treatment-types/treatment-types.module';
import { MedicalHistoryModule } from './modules/medical-history/medical-history.module';
import { NotificationSettingsModule } from './modules/notification-settings/notification-settings.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MessagesModule } from './modules/messages/messages.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    AuthModule,
    UsersModule,
    EmailModule,
    OrganizationsModule,
    FilesModule,
    PatientsModule,
    AppointmentsModule,
    TreatmentsModule,
    TreatmentTypesModule,
    PaymentsModule,
    MedicalHistoryModule,
    NotificationSettingsModule,
    ExpensesModule,
    DashboardModule,
    MessagesModule,
    WhatsappModule,
    RemindersModule,
    SchedulerModule,
    TestModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule { }
