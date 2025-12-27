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

### 1. Create Attachment Entity

**File: `src/common/entities/attachment.entity.ts`**
```typescript
import { Entity, Property, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity({ tableName: 'attachments' })
@Index({ properties: ['orgId'] })
export class Attachment extends BaseEntity {
  @Property({ length: 255 })
  filename!: string;

  @Property({ length: 1024 })
  s3Key!: string;

  @Property({ length: 255 })
  bucket!: string;

  @Property({ length: 255 })
  mimeType!: string;

  @Property({ type: 'integer' })
  size!: number; // in bytes

  constructor(filename: string, s3Key: string, bucket: string, mimeType: string, size: number) {
    super();
    this.filename = filename;
    this.s3Key = s3Key;
    this.bucket = bucket;
    this.mimeType = mimeType;
    this.size = size;
  }
}
```

### 2. Create Tooth Entity (Static Reference)

**File: `src/common/entities/tooth.entity.ts`**
```typescript
import { Entity, Property, PrimaryKey } from '@mikro-orm/core';

@Entity({ tableName: 'teeth' })
export class Tooth {
  @PrimaryKey({ autoincrement: false })
  number!: number; // ISO 3950 or Universal

  @Property({ length: 255 })
  name!: string;

  constructor(number: number, name: string) {
    this.number = number;
    this.name = name;
  }
}
```

### 3. Create Organization Entity

**File: `src/common/entities/organization.entity.ts`**
```typescript
import { Entity, Property, OneToOne } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Attachment } from './attachment.entity';

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

  @OneToOne(() => Attachment, { nullable: true })
  logo?: Attachment;

  @Property({ default: true })
  isActive: boolean = true;

  constructor(name: string) {
    super();
    this.name = name;
    this.orgId = this.id;
  }
}
```

### 4. Create User Entity

**File: `src/common/entities/user.entity.ts`**
```typescript
import { Entity, Property, Collection, OneToMany, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { UserOrganization } from './user-organization.entity';

@Entity({ tableName: 'users' })
@Unique({ properties: ['email'] })
export class User extends BaseEntity {
  @Property({ length: 255 })
  name!: string;

  @Property({ length: 255 })
  email!: string;

  @Property({ length: 255 })
  password!: string;

  @Property({ length: 50, nullable: true })
  phone?: string;

  @Property({ type: 'text', nullable: true })
  refreshToken?: string;

  @Property({ nullable: true })
  refreshTokenExpiresAt?: Date;

  @OneToMany(() => UserOrganization, userOrg => userOrg.user)
  organizations = new Collection<UserOrganization>(this);

  constructor(name: string, email: string, password: string) {
    super();
    this.name = name;
    this.email = email;
    this.password = password;
  }
}
```

### 5. Create UserOrganization Entity

**File: `src/common/entities/user-organization.entity.ts`**
```typescript
import { Entity, Property, ManyToOne, Enum, Unique, Index } from '@mikro-orm/core';
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
@Unique({ properties: ['user', 'orgId'] })
@Index({ properties: ['orgId'] })
export class UserOrganization extends BaseEntity {
  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Organization)
  organization!: Organization;

  @Enum(() => UserRole)
  role!: UserRole;

  @Enum(() => UserStatus)
  status: UserStatus = UserStatus.ACTIVE;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  wallet?: number;

  @Property({ type: 'integer', nullable: true })
  percentage?: number;

  constructor(user: User, orgId: string, role: UserRole) {
    super();
    this.user = user;
    this.orgId = orgId;
    this.role = role;
  }
}
```

### 6. Create Patient Entity

**File: `src/common/entities/patient.entity.ts`**
```typescript
import { Entity, Property, Index, ManyToMany, Collection } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Attachment } from './attachment.entity';

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
  medicalHistory?: any;

  @Property({ default: true })
  enablePaymentReminders: boolean = true;

  @ManyToMany(() => Attachment)
  documents = new Collection<Attachment>(this);
}
```

### 7. Create Treatment Category & Type Entities

**File: `src/common/entities/treatment-category.entity.ts`**
... (Same as before) ...

**File: `src/common/entities/treatment-type.entity.ts`**
```typescript
import { Entity, Property, ManyToOne, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { TreatmentCategory } from './treatment-category.entity';

export interface PriceVariant {
  name: string;
  price: number;
}

@Entity({ tableName: 'treatment_types' })
@Index({ properties: ['orgId'] })
export class TreatmentType extends BaseEntity {
  @Property({ length: 255 })
  name!: string;

  @ManyToOne(() => TreatmentCategory, { nullable: true })
  category?: TreatmentCategory;

  @Property({ type: 'jsonb' })
  priceVariants!: PriceVariant[];

  @Property({ type: 'integer' })
  duration!: number;

  @Property({ length: 7 })
  color!: string;
}
```

### 8. Create Appointment Entity

**File: `src/common/entities/appointment.entity.ts`**
```typescript
import { Entity, Property, ManyToOne, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';
import { TreatmentType } from './treatment-type.entity';
import { User } from './user.entity';

export enum AppointmentStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

@Entity({ tableName: 'appointments' })
@Index({ properties: ['orgId'] })
@Index({ properties: ['date', 'orgId'] })
@Index({ properties: ['patient', 'orgId'] })
export class Appointment extends BaseEntity {
  @ManyToOne(() => Patient)
  patient!: Patient;

  @ManyToOne(() => TreatmentType)
  treatmentType!: TreatmentType;

  @Property({ type: 'date' })
  date!: Date;

  @Property({ type: 'time' })
  time!: string; 

  @Enum(() => AppointmentStatus)
  status: AppointmentStatus = AppointmentStatus.PENDING;

  @ManyToOne(() => User, { nullable: true })
  doctor?: User;

  @Property({ type: 'text', nullable: true })
  notes?: string;
}
```

### 9. Create Treatment Entity

**File: `src/common/entities/treatment.entity.ts`**
```typescript
import { Entity, Property, ManyToOne, Enum, Index, ManyToMany, Collection } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';
import { TreatmentType } from './treatment-type.entity';
import { Appointment } from './appointment.entity';
import { Tooth } from './tooth.entity';

export enum TreatmentStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity({ tableName: 'treatments' })
@Index({ properties: ['orgId'] })
@Index({ properties: ['patient', 'orgId'] })
@Index({ properties: ['status', 'orgId'] })
export class Treatment extends BaseEntity {
  @ManyToOne(() => Patient)
  patient!: Patient;

  @ManyToMany(() => Tooth)
  teeth = new Collection<Tooth>(this);

  @ManyToOne(() => TreatmentType)
  treatmentType!: TreatmentType;

  @ManyToOne(() => Appointment, { nullable: true })
  appointment?: Appointment;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number = 0;

  @Enum(() => TreatmentStatus)
  status: TreatmentStatus = TreatmentStatus.PLANNED;

  @Property({ type: 'text', nullable: true })
  notes?: string;
}
```

### 10. Keep Payment, MedicalHistoryQuestion, NotificationSettings Entities
(Similar structure, ensure imports are correct)

### 11. Create Expense Entity

**File: `src/common/entities/expense.entity.ts`**
```typescript
import { Entity, Property, ManyToOne, Index, OneToOne, Enum } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Attachment } from './attachment.entity';

export enum ExpenseType {
  LAB = 'lab',
  EQUIPMENT = 'equipment',
  UTILITIES = 'utilities',
  RENT = 'rent',
  SALARY = 'salary',
  DOCTOR_PAYMENT = 'doctor_payment',
  OTHER = 'other',
}

@Entity({ tableName: 'expenses' })
@Index({ properties: ['orgId'] })
@Index({ properties: ['date', 'orgId'] })
@Index({ properties: ['doctor', 'orgId'] })
export class Expense extends BaseEntity {
  @Property({ length: 255 })
  name!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Property({ type: 'date' })
  date!: Date;

  @OneToOne(() => Attachment, { nullable: true })
  invoice?: Attachment;

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User, { nullable: true })
  doctor?: User;

  @Enum(() => ExpenseType)
  expenseType: ExpenseType = ExpenseType.OTHER;
}
```

### 12. Update Index File
...

## Acceptance Criteria
- [ ] All entities created with proper decorators
- [ ] Migration generated successfully
- [ ] Database schema created correctly

## Testing Steps
1. Build project
2. Generate migration
3. Run migration
4. Verify schema via psql
