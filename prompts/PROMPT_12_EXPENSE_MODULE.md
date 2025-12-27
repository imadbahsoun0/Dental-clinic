# Prompt 12: Expense Module

## Objective
Implement expense management including doctor payments, with date filtering and categorization.

## Context
- Prompts 1-11 completed
- Expenses include regular expenses and doctor payments
- Secretary can add expenses but cannot view revenue

## Prerequisites
- Prompts 1-11 completed
- Expense entity exists

## Key Features
- Expense CRUD with org scoping
- Expense categories/types
- Invoice file upload (optional - base64 or URL)
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
    expenseType: 'Doctor Payment',
  };
  
  if (doctorId) {
    where.doctorId = doctorId;
  }
  
  return this.em.find(Expense, where, {
    populate: ['doctor'],
    orderBy: { date: 'DESC' },
  });
}
```

## Acceptance Criteria
- [ ] Expense CRUD working
- [ ] Invoice file upload support
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
