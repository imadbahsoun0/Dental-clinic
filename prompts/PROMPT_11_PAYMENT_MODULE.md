# Prompt 11: Payment Module

## Objective
Implement payment management linked to patients with support for multiple payment methods.

## Context
- Prompts 1-10 completed
- Payments linked to patients
- All roles can view, secretary+ can create

## Prerequisites
- Prompts 1-10 completed
- Payment entity exists

## Key Features
- Payment CRUD with org scoping
- Link to patients
- Payment methods: cash, card, transfer, check, other
- Date-based filtering
- Patient payment history

## Files to Create
```
src/modules/payments/
├── payments.module.ts
├── payments.controller.ts
├── payments.service.ts
└── dto/
    ├── create-payment.dto.ts
    ├── update-payment.dto.ts
    └── payment-response.dto.ts
```

## Key DTO Example

```typescript
export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  patientId!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date!: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
```

## Acceptance Criteria
- [ ] Payment CRUD working
- [ ] Link to patients
- [ ] Payment methods supported
- [ ] Date filtering
- [ ] Get patient payment history
- [ ] Org scoping enforced

## Next Steps
Proceed to **Prompt 12: Expense Module**

---
**Estimated Time**: 45-60 minutes
**Difficulty**: Medium
**Dependencies**: Prompts 1-10
