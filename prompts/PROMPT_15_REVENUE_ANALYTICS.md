# Prompt 15: Revenue & Analytics

## Objective
Implement revenue calculation and analytics endpoints with role-based access (admin sees all, dentist sees own, secretary has no access).

## Context
- Prompts 1-14 completed
- Revenue = Treatments - Expenses
- Dentists can only see their own revenue
- Secretaries CANNOT access revenue endpoints

## Prerequisites
- Prompts 1-14 completed
- All data collection modules working

## Key Features
- Organization revenue (admin only)
- Doctor-specific revenue (dentist/admin)
- Date range filtering
- Revenue breakdown (treatments, expenses, net)
- Analytics dashboard data
- Secretary role blocked

## Files to Create
```
src/modules/analytics/
├── analytics.module.ts
├── analytics.controller.ts
├── analytics.service.ts
└── dto/
    ├── date-range.dto.ts
    └── revenue-response.dto.ts
```

## Key Service Methods

```typescript
async getOrgRevenue(orgId: string, startDate?: string, endDate?: string) {
  const dateFilter: any = {};
  if (startDate && endDate) {
    dateFilter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  
  // Total from completed treatments
  const treatments = await this.em.find(Treatment, {
    orgId,
    status: TreatmentStatus.COMPLETED,
    ...dateFilter,
  });
  const treatmentRevenue = treatments.reduce((sum, t) => sum + Number(t.totalPrice), 0);
  
  // Total expenses
  const expenses = await this.em.find(Expense, {
    orgId,
    ...dateFilter,
  });
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  return {
    treatmentRevenue,
    totalExpenses,
    netRevenue: treatmentRevenue - totalExpenses,
    treatmentCount: treatments.length,
    expenseCount: expenses.length,
  };
}

async getDoctorRevenue(userId: string, orgId: string, startDate?: string, endDate?: string) {
  const user = await this.em.findOne(User, { id: userId });
  const userOrg = await this.em.findOne(UserOrganization, {
    userId,
    orgId,
    role: UserRole.DENTIST,
  });
  
  const dateFilter: any = {};
  if (startDate && endDate) {
    dateFilter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  
  // Doctor's completed treatments
  const treatments = await this.em.find(Treatment, {
    orgId,
    drName: user?.name,
    status: TreatmentStatus.COMPLETED,
    ...dateFilter,
  });
  
  const totalRevenue = treatments.reduce((sum, t) => sum + Number(t.totalPrice), 0);
  const commission = totalRevenue * ((userOrg?.percentage || 0) / 100);
  
  return {
    totalRevenue,
    commission,
    percentage: userOrg?.percentage || 0,
    treatmentCount: treatments.length,
    currentWallet: userOrg?.wallet || 0,
  };
}
```

## Controller with Role-Based Access

```typescript
@Controller('analytics')
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  @Get('revenue')
  @Roles(UserRole.ADMIN, UserRole.DENTIST) // Secretary CANNOT access
  async getRevenue(
    @CurrentUser() user: CurrentUserData,
    @Query() dateRange: DateRangeDto,
  ) {
    if (user.role === UserRole.DENTIST) {
      const result = await this.analyticsService.getDoctorRevenue(
        user.id,
        user.orgId,
        dateRange.startDate,
        dateRange.endDate,
      );
      return new StandardResponse(result);
    }
    
    const result = await this.analyticsService.getOrgRevenue(
      user.orgId,
      dateRange.startDate,
      dateRange.endDate,
    );
    return new StandardResponse(result);
  }
  
  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  async getDashboardData(@CurrentUser() user: CurrentUserData) {
    const result = await this.analyticsService.getDashboardData(user.orgId);
    return new StandardResponse(result);
  }
}
```

```

### Generate API Client

Run the following command in the `frontend` directory:

```bash
cd frontend
npm run generate:api
```

### Frontend Integration

**File: `frontend/app/dashboard/page.tsx`** and **`frontend/app/analytics/page.tsx`** (update to use real API):

Create Analytics Dashboard component showing charts.
Fetch data using `api.analytics.analyticsControllerGetRevenue` and `api.analytics.analyticsControllerGetDashboardData`.
Ensure role-based visibility (Secretaries don't see this page/component).

## Acceptance Criteria
- [ ] Organization revenue (admin)
- [ ] Doctor revenue (dentist/admin)
- [ ] Date range filtering
- [ ] Revenue breakdown
- [ ] Dashboard analytics
- [ ] Secretary blocked from access
- [ ] Proper calculations

## Next Steps
Proceed to **Prompt 16: Notification Service**

---
**Estimated Time**: 60-75 minutes
**Difficulty**: Medium-High
**Dependencies**: Prompts 1-14
