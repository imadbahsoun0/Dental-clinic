# Prompt 12: Expense Module

## Objective
Implement expense management including doctor payments, with date filtering and categorization.

## Context
- Prompts 1-11 completed
- Expenses include regular expenses and doctor payments
- Secretary can add expenses but cannot view revenue

## Prerequisites
- Prompts 1-11 completed
- Expense and Attachment entities exist

## Key Features
- Expense CRUD with org scoping
- Expense categories/types (Enum: LAB, EQUIPMENT, RENT, SALARY, DOCTOR_PAYMENT, OTHER)
- Invoice file upload (via Attachment entity link)
- Doctor payment expenses (linked to doctor)
- Date range filtering
- Calculate total expenses

## Files to Create
```
src/modules/expenses/
├── expenses.module.ts
├── expenses.controller.ts
├── expenses.service.ts
└── dto/
    ├── create-expense.dto.ts
    ├── update-expense.dto.ts
    └── expense-response.dto.ts
```

## Key Service Methods

```typescript
import { ExpenseType } from '../../common/entities';

async getTotalExpenses(orgId: string, startDate?: string, endDate?: string) {
  const where: any = { orgId };
  
  if (startDate && endDate) {
    where.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  
  const expenses = await this.em.find(Expense, where);
  const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  
  return { total, count: expenses.length };
}

async getDoctorPayments(orgId: string, doctorId?: string) {
  const where: any = {
    orgId,
    expenseType: ExpenseType.DOCTOR_PAYMENT,
  };
  
  if (doctorId) {
    where.doctor = { id: doctorId };
  }
  
  return this.em.find(Expense, where, {
    populate: ['doctor'],
    orderBy: { date: 'DESC' },
  });
}
```

## Input DTO Example (CreateExpenseDto)
```typescript
export class CreateExpenseDto {
    @ApiProperty()
    name!: string;
    
    @ApiProperty()
    amount!: number;
    
    @ApiProperty({ enum: ExpenseType })
    expenseType!: ExpenseType;
    
    @ApiProperty({ required: false })
    invoiceId?: string; // Links to Attachment

    // ...
}
```

## Acceptance Criteria
- [ ] Expense CRUD working
- [ ] Invoice file upload support (via Attachment ID)
- [ ] Doctor payment expenses
- [ ] Date range filtering
- [ ] Calculate total expenses
- [ ] Get doctor payments
- [ ] Org scoping enforced

## Next Steps
Proceed to **Prompt 13: Settings Module**

---
**Estimated Time**: 45-60 minutes
**Difficulty**: Medium
**Dependencies**: Prompts 1-11
