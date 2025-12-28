# Prompt 13: Settings Module

## Objective
Implement settings management for appointment types, treatment categories, medical history questions, clinic branding, and notification settings.

## Context
- Prompts 1-12 completed
- Admin-only access
- Multiple setting types to manage

## Prerequisites
- Prompts 1-12 completed
- TreatmentCategory, AppointmentType, MedicalHistoryQuestion, NotificationSettings entities exist

## Key Features
- Appointment types CRUD (with price variants)
- Treatment categories CRUD
- Medical history questions CRUD
- Clinic branding (logo, colors)
- Notification settings (WhatsApp/Email templates)
- All admin-only

## Files to Create
```
src/modules/settings/
├── settings.module.ts
├── settings.controller.ts
├── settings.service.ts
└── dto/
    ├── appointment-type.dto.ts
    ├── treatment-category.dto.ts
    ├── medical-history-question.dto.ts
    └── notification-settings.dto.ts
```

## Key Endpoints Structure

```typescript
@Controller('settings')
@Roles(UserRole.ADMIN)
export class SettingsController {
  // Appointment Types
  @Post('appointment-types')
  @Get('appointment-types')
  @Patch('appointment-types/:id')
  @Delete('appointment-types/:id')
  
  // Treatment Categories
  @Post('treatment-categories')
  @Get('treatment-categories')
  @Patch('treatment-categories/:id')
  @Delete('treatment-categories/:id')
  
  // Medical History Questions
  @Post('medical-history-questions')
  @Get('medical-history-questions')
  @Patch('medical-history-questions/:id')
  @Delete('medical-history-questions/:id')
  
  // Notification Settings
  @Get('notifications')
  @Patch('notifications')
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

**File: `frontend/app/settings/page.tsx`** (update to use real API):

Create management tabs for "Appointment Types", "Treatment Categories", and "Medical History".
Fetch data using `api.settings.settingsControllerGetAppointmentTypes` (etc).
Implement Create/Update forms connecting to the respective API endpoints.

## Acceptance Criteria
- [ ] Appointment types CRUD
- [ ] Treatment categories CRUD
- [ ] Medical history questions CRUD
- [ ] Notification settings get/update
- [ ] All admin-only
- [ ] Org scoping enforced
- [ ] Price variants support for appointment types

## Next Steps
Proceed to **Prompt 14: Doctor Wallet & Commission**

---
**Estimated Time**: 60-75 minutes
**Difficulty**: Medium
**Dependencies**: Prompts 1-12
