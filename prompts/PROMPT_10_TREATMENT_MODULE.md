# Prompt 10: Treatment Module

## Objective
Implement treatment management with automatic doctor wallet updates on completion, role-based access, and appointment linking.

## Context
- Prompts 1-9 completed
- Treatments link to appointments and patients
- Auto-update doctor wallet when status changes to completed
- Dentists can only view own treatments (via linked appointment)

## Prerequisites
- Prompts 1-9 completed
- Treatment, Tooth, and TreatmentType entities exist

## Tasks

### 1. Create Treatment DTOs

**File: `src/modules/treatments/dto/create-treatment.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsString, IsEnum, IsOptional, IsArray, Min } from 'class-validator';
import { TreatmentStatus } from '../../../common/entities';

export class CreateTreatmentDto {
  @ApiProperty()
  @IsUUID()
  patientId!: string;

  @ApiProperty()
  @IsUUID()
  treatmentTypeId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiProperty({ type: [Number], example: [11, 21] })
  @IsArray()
  @IsNumber({}, { each: true })
  toothNumbers?: number[]; // Links to Tooth entity

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalPrice!: number;

  @ApiProperty({ default: 0 })
  @IsNumber()
  @Min(0)
  discount: number = 0;

  @ApiProperty({ enum: TreatmentStatus, default: TreatmentStatus.PLANNED })
  @IsOptional()
  @IsEnum(TreatmentStatus)
  status?: TreatmentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
```

### 2. Update Treatment Service Logic

**Key Logic for Wallet Update (in `treatments.service.ts`):**

When updating status to `COMPLETED`:
1. Ensure the treatment has a linked appointment.
2. Retrieve the doctor from the appointment.
3. Find the `UserOrganization` record for that doctor.
4. Calculate commission based on `totalPrice` and doctor's `percentage`.
5. Update doctor's wallet.

```typescript
async updateStatus(id: string, status: TreatmentStatus, orgId: string, userId: string, role: string, updatedBy: string) {
  const treatment = await this.em.findOne(Treatment, { id, orgId }, { populate: ['appointment.doctor'] });
  
  if (!treatment) throw new NotFoundException('Treatment not found');

  const oldStatus = treatment.status;
  
  // Update doctor wallet when treatment is completed
  if (status === TreatmentStatus.COMPLETED && oldStatus !== TreatmentStatus.COMPLETED) {
    if (!treatment.appointment?.doctor) {
        // Warning: Completed treatment without assigned doctor/appointment
    } else {
        const doctor = treatment.appointment.doctor;
        const userOrg = await this.em.findOne(UserOrganization, {
          orgId,
          user: doctor,
          role: UserRole.DENTIST,
        });
        
        if (userOrg && userOrg.percentage) {
          const commission = treatment.totalPrice * (userOrg.percentage / 100);
          userOrg.wallet = Number(userOrg.wallet || 0) + commission;
        }
    }
  }
  
  treatment.status = status;
  treatment.updatedBy = updatedBy;
  
  await this.em.flush();
  return treatment;
}
```

During creation, if `toothNumbers` are provided, link them:
```typescript
if (createDto.toothNumbers?.length) {
    const teeth = await this.em.find(Tooth, { number: { $in: createDto.toothNumbers } });
    treatment.teeth.set(teeth);
}
```

## Files to Create
- `src/modules/treatments/treatments.module.ts`
- `src/modules/treatments/treatments.controller.ts`
- `src/modules/treatments/treatments.service.ts`
- `src/modules/treatments/dto/create-treatment.dto.ts`
- `src/modules/treatments/dto/update-treatment.dto.ts`
- `src/modules/treatments/dto/update-status.dto.ts`

## Acceptance Criteria
- [ ] Treatment CRUD working
- [ ] Role-based access (dentists see own only)
- [ ] Link to appointments
- [ ] Status update endpoint
- [ ] Wallet auto-update on completion (via Appointment Doctor)
- [ ] Support for multiple tooth numbers (Tooth entity relation)

## Next Steps
Proceed to **Prompt 11: Payment Module**

---
**Estimated Time**: 60-75 minutes
**Difficulty**: Medium-High
**Dependencies**: Prompts 1-9
