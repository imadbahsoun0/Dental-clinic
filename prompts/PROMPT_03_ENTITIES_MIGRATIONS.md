# Prompt 3: Database Entities & Migrations

## Objective
Create all database entities based on the frontend data models and generate initial migrations for the database schema.

## Context
- Prompt 1 completed: NestJS project initialized
- Prompt 2 completed: Common utilities created
- Base entity with audit fields exists
- MikroORM configured and ready

## Prerequisites
- Prompts 1 and 2 completed successfully
- PostgreSQL database created and running
- Application running without errors

## Tasks

### 1. Create Organization Entity

**File: `src/common/entities/organization.entity.ts`**
```typescript
import { Entity, Property, Collection, OneToMany } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity({ tableName: 'organizations' })
export class Organization extends BaseEntity {
  @Property({ length: 255 })
  name!: string;

  @Property({ type: 'text', nullable: true })
  location?: string;

  @Property({ length: 50, nullable: true })
  phone?: string;

  @Property({ length: 255, nullable: true })
  email?: string;

  @Property({ length: 255, nullable: true })
  website?: string;

  @Property({ type: 'text', nullable: true })
  logo?: string; // base64 or URL

  @Property({ default: true })
  isActive: boolean = true;

  constructor(name: string) {
    super();
    this.name = name;
    // For Organization, orgId references itself
    this.orgId = this.id;
  }
}
```

### 2. Create User Entity

**File: `src/common/entities/user.entity.ts`**
```typescript
import { Entity, Property, Collection, OneToMany, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { UserOrganization } from './user-organization.entity';

@Entity({ tableName: 'users' })
@Index({ properties: ['email'], unique: true })
export class User extends BaseEntity {
  @Property({ length: 255 })
  name!: string;

  @Property({ length: 255, unique: true })
  email!: string;

  @Property({ length: 255 })
  password!: string; // Will be hashed

  @Property({ length: 50, nullable: true })
  phone?: string;

  @Property({ type: 'text', nullable: true })
  refreshToken?: string; // For token revocation

  @Property({ nullable: true })
  refreshTokenExpiresAt?: Date;

  @OneToMany(() => UserOrganization, userOrg => userOrg.user)
  organizations = new Collection<UserOrganization>(this);

  constructor(name: string, email: string, password: string) {
    super();
    this.name = name;
    this.email = email;
    this.password = password;
    // User entity doesn't have orgId since they can belong to multiple orgs
    // We'll set it to a default value and override in BaseEntity
  }
}
```

### 3. Create UserOrganization Entity (Junction Table)

**File: `src/common/entities/user-organization.entity.ts`**
```typescript
import { Entity, Property, ManyToOne, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum UserRole {
  ADMIN = 'admin',
  DENTIST = 'dentist',
  SECRETARY = 'secretary',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity({ tableName: 'user_organizations' })
@Index({ properties: ['userId', 'orgId'], unique: true })
@Index({ properties: ['orgId'] })
export class UserOrganization extends BaseEntity {
  @ManyToOne(() => User)
  user!: User;

  @Property({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => Organization)
  organization!: Organization;

  @Enum(() => UserRole)
  role!: UserRole;

  @Enum(() => UserStatus)
  status: UserStatus = UserStatus.ACTIVE;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  wallet?: number; // For dentists only - wallet per organization

  @Property({ type: 'integer', nullable: true })
  percentage?: number; // Commission percentage for dentists - per organization

  constructor(userId: string, orgId: string, role: UserRole) {
    super();
    this.userId = userId;
    this.orgId = orgId;
    this.role = role;
  }
}
```

### 3. Create Patient Entity

**File: `src/common/entities/patient.entity.ts`**
```typescript
import { Entity, Property, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity({ tableName: 'patients' })
@Index({ properties: ['orgId'] })
@Index({ properties: ['mobileNumber', 'orgId'] })
@Index({ properties: ['email', 'orgId'] })
export class Patient extends BaseEntity {
  @Property({ length: 255 })
  firstName!: string;

  @Property({ length: 255 })
  lastName!: string;

  @Property({ length: 50 })
  mobileNumber!: string;

  @Property({ length: 255, nullable: true })
  email?: string;

  @Property({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Property({ type: 'text', nullable: true })
  address?: string;

  @Property({ type: 'jsonb', nullable: true })
  medicalHistory?: any; // JSON object for medical history

  @Property({ default: true })
  enablePaymentReminders: boolean = true;
}
```

### 4. Create Treatment Category Entity

**File: `src/common/entities/treatment-category.entity.ts`**
```typescript
import { Entity, Property, Collection, OneToMany, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity({ tableName: 'treatment_categories' })
@Index({ properties: ['orgId'] })
export class TreatmentCategory extends BaseEntity {
  @Property({ length: 255 })
  name!: string;

  @Property({ length: 10 })
  icon!: string; // emoji

  @Property({ type: 'integer' })
  order!: number;
}
```

### 5. Create Appointment Type Entity

**File: `src/common/entities/appointment-type.entity.ts`**
```typescript
import { Entity, Property, ManyToOne, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { TreatmentCategory } from './treatment-category.entity';

@Entity({ tableName: 'appointment_types' })
@Index({ properties: ['orgId'] })
export class AppointmentType extends BaseEntity {
  @Property({ length: 255 })
  name!: string;

  @ManyToOne(() => TreatmentCategory, { nullable: true })
  category?: TreatmentCategory;

  @Property({ type: 'jsonb' })
  priceVariants!: any[]; // Array of PriceVariant objects

  @Property({ type: 'integer' })
  duration!: number; // in minutes

  @Property({ length: 7 })
  color!: string; // hex color code
}
```

### 6. Create Appointment Entity

**File: `src/common/entities/appointment.entity.ts`**
```typescript
import { Entity, Property, ManyToOne, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';
import { AppointmentType } from './appointment-type.entity';

export enum AppointmentStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

@Entity({ tableName: 'appointments' })
@Index({ properties: ['orgId'] })
@Index({ properties: ['date', 'orgId'] })
@Index({ properties: ['patientId', 'orgId'] })
export class Appointment extends BaseEntity {
  @ManyToOne(() => Patient)
  patient!: Patient;

  @Property({ type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => AppointmentType)
  appointmentType!: AppointmentType;

  @Property({ type: 'uuid' })
  appointmentTypeId!: string;

  @Property({ type: 'date' })
  date!: Date;

  @Property({ type: 'time' })
  time!: string; // HH:mm format

  @Enum(() => AppointmentStatus)
  status: AppointmentStatus = AppointmentStatus.PENDING;

  @Property({ length: 255, nullable: true })
  drName?: string;

  @Property({ type: 'text', nullable: true })
  notes?: string;
}
```

### 7. Create Treatment Entity

**File: `src/common/entities/treatment.entity.ts`**
```typescript
import { Entity, Property, ManyToOne, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';
import { AppointmentType } from './appointment-type.entity';
import { Appointment } from './appointment.entity';

export enum TreatmentStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity({ tableName: 'treatments' })
@Index({ properties: ['orgId'] })
@Index({ properties: ['patientId', 'orgId'] })
@Index({ properties: ['date', 'orgId'] })
@Index({ properties: ['status', 'orgId'] })
export class Treatment extends BaseEntity {
  @ManyToOne(() => Patient)
  patient!: Patient;

  @Property({ type: 'uuid' })
  patientId!: string;

  @Property({ type: 'integer' })
  toothNumber!: number; // Legacy: single tooth

  @Property({ type: 'jsonb', nullable: true })
  toothNumbers?: number[]; // New: support multiple teeth

  @Property({ length: 255, nullable: true })
  toothName?: string;

  @ManyToOne(() => AppointmentType)
  appointmentType!: AppointmentType;

  @Property({ type: 'uuid' })
  appointmentTypeId!: string;

  @ManyToOne(() => Appointment, { nullable: true })
  appointment?: Appointment;

  @Property({ type: 'uuid', nullable: true })
  appointmentId?: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number = 0;

  @Property({ type: 'date' })
  date!: Date;

  @Property({ length: 255, nullable: true })
  drName?: string;

  @Enum(() => TreatmentStatus)
  status: TreatmentStatus = TreatmentStatus.PLANNED;

  @Property({ type: 'text', nullable: true })
  notes?: string;
}
```

### 8. Create Payment Entity

**File: `src/common/entities/payment.entity.ts`**
```typescript
import { Entity, Property, ManyToOne, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  CHECK = 'check',
  OTHER = 'other',
}

@Entity({ tableName: 'payments' })
@Index({ properties: ['orgId'] })
@Index({ properties: ['patientId', 'orgId'] })
@Index({ properties: ['date', 'orgId'] })
export class Payment extends BaseEntity {
  @ManyToOne(() => Patient)
  patient!: Patient;

  @Property({ type: 'uuid' })
  patientId!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Property({ type: 'date' })
  date!: Date;

  @Enum(() => PaymentMethod)
  paymentMethod!: PaymentMethod;

  @Property({ type: 'text', nullable: true })
  notes?: string;
}
```

### 9. Create Expense Entity

**File: `src/common/entities/expense.entity.ts`**
```typescript
import { Entity, Property, ManyToOne, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ tableName: 'expenses' })
@Index({ properties: ['orgId'] })
@Index({ properties: ['date', 'orgId'] })
@Index({ properties: ['doctorId', 'orgId'] })
export class Expense extends BaseEntity {
  @Property({ length: 255 })
  name!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Property({ type: 'date' })
  date!: Date;

  @Property({ type: 'text', nullable: true })
  invoiceFile?: string;

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User, { nullable: true })
  doctor?: User;

  @Property({ type: 'uuid', nullable: true })
  doctorId?: string;

  @Property({ length: 255, nullable: true })
  expenseType?: string;
}
```

### 10. Create Medical History Question Entity

**File: `src/common/entities/medical-history-question.entity.ts`**
```typescript
import { Entity, Property, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

export enum QuestionType {
  TEXT = 'text',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
}

@Entity({ tableName: 'medical_history_questions' })
@Index({ properties: ['orgId'] })
export class MedicalHistoryQuestion extends BaseEntity {
  @Property({ type: 'text' })
  question!: string;

  @Enum(() => QuestionType)
  type!: QuestionType;

  @Property({ type: 'jsonb', nullable: true })
  options?: string[]; // for radio/checkbox

  @Property({ default: false })
  required: boolean = false;

  @Property({ type: 'integer' })
  order!: number;
}
```

### 11. Create Notification Settings Entity

**File: `src/common/entities/notification-settings.entity.ts`**
```typescript
import { Entity, Property, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity({ tableName: 'notification_settings' })
@Index({ properties: ['orgId'], unique: true })
export class NotificationSettings extends BaseEntity {
  @Property({ type: 'jsonb' })
  appointmentReminder!: {
    enabled: boolean;
    timing: number;
    timingUnit: 'hours' | 'days';
    messageTemplate: string;
  };

  @Property({ type: 'jsonb' })
  paymentReminder!: {
    enabled: boolean;
    timing: number;
    timingUnit: 'hours' | 'days';
    messageTemplate: string;
  };
}
```

### 12. Update MikroORM Config

**File: `src/mikro-orm.config.ts`** (update entities path):
```typescript
import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

const config: Options = {
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_NAME || 'dental_clinic',
  entities: ['dist/common/entities/**/*.entity.js'],
  entitiesTs: ['src/common/entities/**/*.entity.ts'],
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
    snapshot: false,
    disableForeignKeys: false,
  },
  extensions: [Migrator],
  debug: process.env.NODE_ENV !== 'production',
  allowGlobalContext: true,
};

export default config;
```

### 13. Create Initial Migration

```bash
# Generate migration
npm run migration:create -- --name=initial_schema

# Review the generated migration file in src/migrations/
# Verify all entities are included

# Run migration
npm run migration:up
```

### 14. Create Index File for Entities

**File: `src/common/entities/index.ts`**
```typescript
export * from './base.entity';
export * from './organization.entity';
export * from './user.entity';
export * from './user-organization.entity';
export * from './patient.entity';
export * from './treatment-category.entity';
export * from './appointment-type.entity';
export * from './appointment.entity';
export * from './treatment.entity';
export * from './payment.entity';
export * from './expense.entity';
export * from './medical-history-question.entity';
export * from './notification-settings.entity';
```

## Acceptance Criteria

- [ ] All entities created with proper decorators
- [ ] Indexes added for frequently queried fields
- [ ] All entities extend BaseEntity
- [ ] orgId field present in all entities
- [ ] Enums defined for status fields
- [ ] Relationships properly defined
- [ ] Migration generated successfully
- [ ] Migration runs without errors
- [ ] Database schema created correctly
- [ ] No TypeScript compilation errors

## Testing Steps

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Generate migration**:
   ```bash
   npm run migration:create -- --name=initial_schema
   ```

3. **Review migration**:
   - Check `src/migrations/` for the generated file
   - Verify all tables are included
   - Verify indexes are created

4. **Run migration**:
   ```bash
   npm run migration:up
   ```

5. **Verify database**:
   ```bash
   psql -U postgres -d dental_clinic -c "\dt"
   ```
   Should show all tables

6. **Check schema**:
   ```bash
   psql -U postgres -d dental_clinic -c "\d+ users"
   ```
   Verify columns and indexes

## Files Created

```
src/common/entities/
├── index.ts
├── base.entity.ts (already exists)
├── organization.entity.ts
├── user.entity.ts
├── user-organization.entity.ts
├── patient.entity.ts
├── treatment-category.entity.ts
├── appointment-type.entity.ts
├── appointment.entity.ts
├── treatment.entity.ts
├── payment.entity.ts
├── expense.entity.ts
├── medical-history-question.entity.ts
└── notification-settings.entity.ts

src/migrations/
└── Migration[timestamp]_initial_schema.ts
```

## Common Issues & Solutions

1. **Migration fails**: Check entity decorators and relationships
2. **Duplicate columns**: Ensure no conflicting property names
3. **Type errors**: Verify all imports are correct
4. **Index errors**: Check index syntax and field names

## Next Steps

After completing this prompt:
- Proceed to **Prompt 4: Auth Module with JWT**
- Do not proceed until all acceptance criteria are met
- Verify database schema is correct

## Notes

- All entities are in `common/entities` as per requirements
- Indexes added for performance on large datasets
- JSONB used for flexible data (medical history, price variants)
- Enums used for type safety
- Relationships defined but can be lazy-loaded

---

**Estimated Time**: 60-90 minutes
**Difficulty**: Medium-High
**Dependencies**: Prompts 1, 2
