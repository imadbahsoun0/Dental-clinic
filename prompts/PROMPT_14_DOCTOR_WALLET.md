# Prompt 14: Doctor Wallet & Commission

## Objective
Implement doctor wallet management with commission tracking, payment processing, and wallet history.

## Context
- Prompts 1-13 completed
- Wallet already updated automatically when treatments complete (Prompt 10)
- Need endpoints to view wallet, pay doctors, and track history

## Prerequisites
- Prompts 1-13 completed
- UserOrganization entity has wallet and percentage fields
- Treatment completion already updates wallet

## Key Features
- View own wallet (dentists)
- View all wallets (admin)
- Pay doctor (creates expense, deducts from wallet)
- Wallet history/transactions
- Commission calculation summary

## Files to Create
```
src/modules/wallet/
├── wallet.module.ts
├── wallet.controller.ts
├── wallet.service.ts
└── dto/
    ├── pay-doctor.dto.ts
    └── wallet-response.dto.ts
```

## Key Service Methods

```typescript
async getWallet(userId: string, orgId: string) {
  const userOrg = await this.em.findOne(UserOrganization, {
    userId,
    orgId,
    role: UserRole.DENTIST,
  }, { populate: ['user'] });
  
  if (!userOrg) {
    throw new NotFoundException('Wallet not found');
  }
  
  return {
    userId: userOrg.userId,
    userName: userOrg.user.name,
    wallet: userOrg.wallet || 0,
    percentage: userOrg.percentage || 0,
  };
}

async payDoctor(doctorId: string, amount: number, orgId: string, paidBy: string) {
  const userOrg = await this.em.findOne(UserOrganization, {
    userId: doctorId,
    orgId,
    role: UserRole.DENTIST,
  });
  
  if (!userOrg) {
    throw new NotFoundException('Doctor not found');
  }
  
  if ((userOrg.wallet || 0) < amount) {
    throw new BadRequestException('Insufficient wallet balance');
  }
  
  // Deduct from wallet
  userOrg.wallet = (userOrg.wallet || 0) - amount;
  
  // Create expense record
  const expense = this.em.create(Expense, {
    name: 'Doctor Payment',
    amount,
    date: new Date(),
    doctorId,
    expenseType: 'Doctor Payment',
    orgId,
    createdBy: paidBy,
  });
  
  this.em.persist(expense);
  await this.em.flush();
  
  return {
    message: 'Payment successful',
    newBalance: userOrg.wallet,
  };
}

async getWalletHistory(doctorId: string, orgId: string) {
  // Get completed treatments (credits)
  const treatments = await this.em.find(Treatment, {
    orgId,
    drName: (await this.em.findOne(User, { id: doctorId }))?.name,
    status: TreatmentStatus.COMPLETED,
  }, { orderBy: { updatedAt: 'DESC' } });
  
  // Get payments (debits)
  const payments = await this.em.find(Expense, {
    orgId,
    doctorId,
    expenseType: 'Doctor Payment',
  }, { orderBy: { date: 'DESC' } });
  
  return { treatments, payments };
}
```

## Acceptance Criteria
- [ ] Get own wallet (dentist)
- [ ] Get all wallets (admin)
- [ ] Pay doctor endpoint
- [ ] Wallet history
- [ ] Commission summary
- [ ] Insufficient balance check
- [ ] Creates expense on payment

## Next Steps
Proceed to **Prompt 15: Revenue & Analytics**

---
**Estimated Time**: 45-60 minutes
**Difficulty**: Medium
**Dependencies**: Prompts 1-13
