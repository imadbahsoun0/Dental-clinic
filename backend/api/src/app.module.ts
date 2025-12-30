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
