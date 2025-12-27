# Prompt 10: Treatment Module

## Objective
Implement treatment management with automatic doctor wallet updates on completion, role-based access, and appointment linking.

## Context
- Prompts 1-9 completed
- Treatments link to appointments and patients
- Auto-update doctor wallet when status changes to completed
- Dentists can only view own treatments

## Prerequisites
- Prompts 1-9 completed
- Treatment entity exists

## Key Service Method - Wallet Update

```typescript
async updateStatus(id: string, status: TreatmentStatus, orgId: string, userId: string, role: string, updatedBy: string) {
  const treatment = await this.findOne(id, orgId, userId, role);
  
  const oldStatus = treatment.status;
  
  // Update doctor wallet when treatment is completed
  if (status === TreatmentStatus.COMPLETED && oldStatus !== TreatmentStatus.COMPLETED) {
    const userOrg = await this.em.findOne(UserOrganization, {
      orgId,
      user: { name: treatment.drName },
      role: UserRole.DENTIST,
    }, { populate: ['user'] });
    
    if (userOrg && userOrg.percentage) {
      const commission = treatment.totalPrice * (userOrg.percentage / 100);
      userOrg.wallet = (userOrg.wallet || 0) + commission;
    }
  }
  
  treatment.status = status;
  treatment.updatedBy = updatedBy;
  
  await this.em.flush();
  return treatment;
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
- [ ] Wallet auto-update on completion
- [ ] Support for multiple tooth numbers

## Next Steps
Proceed to **Prompt 11: Payment Module**

---
**Estimated Time**: 60-75 minutes
**Difficulty**: Medium-High
**Dependencies**: Prompts 1-9
