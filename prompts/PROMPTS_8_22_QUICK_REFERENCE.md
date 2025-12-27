# Remaining Prompts - Quick Reference Guide

This document provides the structure and key code for Prompts 8-22. Each section can be expanded into a full prompt when needed.

---

## PROMPT 8: Patient Module (60-75 min)

### Key Features
- Patient CRUD with org scoping
- Medical history management
- Search and pagination
- Role-based access (all roles can view, secretary+ can create/edit)

### Main Files
- `src/modules/patients/patients.service.ts` - CRUD with orgId filtering
- `src/modules/patients/patients.controller.ts` - REST endpoints
- `src/modules/patients/dto/` - create, update, response DTOs

### Key Code Snippet
```typescript
// Service method example
async findAll(orgId: string, pagination: PaginationDto, filter?: FilterDto) {
  const qb = this.em.createQueryBuilder(Patient);
  qb.where({ orgId });
  
  if (filter?.search) {
    qb.andWhere({
      $or: [
        { firstName: { $ilike: `%${filter.search}%` } },
        { lastName: { $ilike: `%${filter.search}%` } },
        { mobileNumber: { $ilike: `%${filter.search}%` } },
      ],
    });
  }
  
  const [patients, total] = await qb.getResultAndCount();
  return { data: patients, meta: { total, page, limit, totalPages } };
}
```

---

## PROMPT 9: Appointment Module (60-75 min)

### Key Features
- Appointment CRUD with org scoping
- Dentist can only view own appointments
- Secretary/Admin can view all
- Link to patients and appointment types

### Main Files
- `src/modules/appointments/appointments.service.ts`
- `src/modules/appointments/appointments.controller.ts`
- DTOs for create, update, response

### Key Code Snippet
```typescript
// Role-based filtering
async findAll(orgId: string, userId: string, role: string, pagination: PaginationDto) {
  const where: any = { orgId };
  
  // Dentists can only see their own appointments
  if (role === UserRole.DENTIST) {
    const user = await this.em.findOne(User, { id: userId });
    where.drName = user.name;
  }
  
  return this.em.findAndCount(Appointment, where, {
    populate: ['patient', 'appointmentType'],
    limit, offset,
  });
}
```

---

## PROMPT 10: Treatment Module (60-75 min)

### Key Features
- Treatment CRUD with org scoping
- Link to appointments
- Status management (planned, in-progress, completed, cancelled)
- Dentist can only view own treatments
- Auto-update doctor wallet on completion

### Main Files
- `src/modules/treatments/treatments.service.ts`
- `src/modules/treatments/treatments.controller.ts`
- DTOs with tooth numbers support

### Key Code Snippet
```typescript
async updateStatus(id: string, status: TreatmentStatus, orgId: string, userId: string) {
  const treatment = await this.em.findOne(Treatment, { id, orgId });
  
  if (status === TreatmentStatus.COMPLETED && treatment.status !== TreatmentStatus.COMPLETED) {
    // Update doctor wallet
    const userOrg = await this.em.findOne(UserOrganization, {
      orgId,
      user: { name: treatment.drName },
      role: UserRole.DENTIST,
    });
    
    if (userOrg && userOrg.percentage) {
      const commission = treatment.totalPrice * (userOrg.percentage / 100);
      userOrg.wallet = (userOrg.wallet || 0) + commission;
    }
  }
  
  treatment.status = status;
  await this.em.flush();
}
```

---

## PROMPT 11: Payment Module (45-60 min)

### Key Features
- Payment CRUD with org scoping
- Link to patients
- Payment methods (cash, card, transfer, check, other)
- All roles can view, secretary+ can create

### Main Files
- `src/modules/payments/payments.service.ts`
- `src/modules/payments/payments.controller.ts`
- DTOs for payment creation and response

---

## PROMPT 12: Expense Module (45-60 min)

### Key Features
- Expense CRUD with org scoping
- Expense categories
- Invoice file upload (optional)
- Doctor payment expenses
- Secretary cannot view revenue-related expenses

### Main Files
- `src/modules/expenses/expenses.service.ts`
- `src/modules/expenses/expenses.controller.ts`
- DTOs with file upload support

---

## PROMPT 13: Settings Module (60-75 min)

### Key Features
- Appointment types management
- Treatment categories management
- Medical history questions
- Clinic branding
- Notification settings (WhatsApp/Email templates)
- Admin only access

### Main Files
- `src/modules/settings/settings.service.ts`
- `src/modules/settings/settings.controller.ts`
- Multiple DTOs for each setting type

---

## PROMPT 14: Doctor Wallet & Commission (45-60 min)

### Key Features
- Wallet balance per organization
- Commission calculation
- Payment to doctors (creates expense)
- Wallet history
- Dentist can view own wallet, Admin can view all

### Main Files
- `src/modules/wallet/wallet.service.ts`
- `src/modules/wallet/wallet.controller.ts`
- DTOs for wallet operations

### Key Code Snippet
```typescript
async payDoctor(doctorId: string, amount: number, orgId: string, paidBy: string) {
  const userOrg = await this.em.findOne(UserOrganization, {
    userId: doctorId,
    orgId,
    role: UserRole.DENTIST,
  });
  
  if (userOrg.wallet < amount) {
    throw new BadRequestException('Insufficient wallet balance');
  }
  
  userOrg.wallet -= amount;
  
  // Create expense record
  const expense = new Expense();
  expense.name = 'Doctor Payment';
  expense.amount = amount;
  expense.doctorId = doctorId;
  expense.expenseType = 'Doctor Payment';
  expense.orgId = orgId;
  expense.createdBy = paidBy;
  
  this.em.persist(expense);
  await this.em.flush();
}
```

---

## PROMPT 15: Revenue & Analytics (60-75 min)

### Key Features
- Revenue calculations (treatments - expenses)
- Doctor-specific revenue (for dentists)
- Organization-wide revenue (for admins)
- Date range filtering
- Analytics dashboard data
- Secretary CANNOT access

### Main Files
- `src/modules/analytics/analytics.service.ts`
- `src/modules/analytics/analytics.controller.ts`
- DTOs for revenue reports

### Key Code Snippet
```typescript
@Get('revenue')
@Roles(UserRole.ADMIN, UserRole.DENTIST)
async getRevenue(@CurrentUser() user: CurrentUserData, @Query() dateRange: DateRangeDto) {
  if (user.role === UserRole.DENTIST) {
    return this.analyticsService.getDoctorRevenue(user.id, user.orgId, dateRange);
  }
  return this.analyticsService.getOrgRevenue(user.orgId, dateRange);
}
```

---

## PROMPT 16: Notification Service - Microservice (90-120 min)

### Key Features
- Separate NestJS microservice
- AWS SQS consumer
- WhatsApp notifications via WAHA
- Email notifications via Gmail SMTP
- Appointment reminders (X hours before)
- Payment reminders (X days overdue)
- Queue message processing

### Main Files
- `backend/notification-service/` - New NestJS project
- `src/sqs/sqs.consumer.ts` - SQS message handler
- `src/whatsapp/whatsapp.service.ts` - WAHA integration
- `src/email/email.service.ts` - SMTP integration
- `src/notifications/notifications.processor.ts` - Process reminders

### Setup
```bash
cd backend
npx @nestjs/cli new notification-service
cd notification-service
npm install @aws-sdk/client-sqs nodemailer axios
```

---

## PROMPT 17: Swagger Client Generation (30-45 min)

### Key Features
- Install swagger-typescript-api
- Generate TypeScript client from Swagger
- Configure output directory in frontend
- Type-safe API calls

### Commands
```bash
cd frontend
npm install --save-dev swagger-typescript-api
```

### package.json script
```json
{
  "scripts": {
    "generate:api": "swagger-typescript-api -p http://localhost:3000/api/docs-json -o ./lib/api -n api.ts --axios"
  }
}
```

---

## PROMPT 18: Frontend API Integration (90-120 min)

### Key Features
- Update all Zustand stores to use API client
- Replace dummy data with real API calls
- Error handling with try-catch
- Loading states
- Toast notifications (success/error)
- Token management

### Files to Update
- `frontend/store/patientStore.ts`
- `frontend/store/appointmentStore.ts`
- `frontend/store/treatmentStore.ts`
- `frontend/store/paymentStore.ts`
- `frontend/store/expenseStore.ts`
- `frontend/store/settingsStore.ts`

### Example
```typescript
// Before
addPatient: (patient) => {
  set((state) => ({ patients: [...state.patients, patient] }));
}

// After
addPatient: async (patient) => {
  try {
    const response = await api.patients.create(patient);
    set((state) => ({ patients: [...state.patients, response.data] }));
    toast.success('Patient created successfully');
  } catch (error) {
    toast.error('Failed to create patient');
    throw error;
  }
}
```

---

## PROMPT 19: Form Validation with React Hook Form (60-90 min)

### Key Features
- Shared FormControl component
- React Hook Form integration
- Client-side validation
- Error message display under inputs
- Form submission handling

### Main Files
- `frontend/components/common/FormControl.tsx`
- `frontend/components/common/Form.tsx`
- Update all modal forms to use React Hook Form

### Example Component
```typescript
import { useForm } from 'react-hook-form';

export function FormControl({ name, label, error, register, ...props }) {
  return (
    <div className="form-control">
      <label>{label}</label>
      <input {...register(name)} {...props} />
      {error && <span className="error">{error.message}</span>}
    </div>
  );
}

// Usage
const { register, handleSubmit, formState: { errors } } = useForm();

<FormControl
  name="firstName"
  label="First Name"
  register={register}
  error={errors.firstName}
  validation={{ required: 'First name is required' }}
/>
```

---

## PROMPT 20: Role-Based UI Components (60-75 min)

### Key Features
- RoleGuard component for conditional rendering
- Hide/show features based on role
- Organization selector integration
- Update navigation based on permissions

### Main Files
- `frontend/components/auth/RoleGuard.tsx`
- `frontend/components/auth/PermissionGuard.tsx`
- Update all pages to use role guards

### Example
```typescript
export function RoleGuard({ roles, children }) {
  const { currentOrg } = useAuthStore();
  
  if (!currentOrg || !roles.includes(currentOrg.role)) {
    return null;
  }
  
  return <>{children}</>;
}

// Usage
<RoleGuard roles={['admin', 'secretary']}>
  <Button onClick={handleDelete}>Delete</Button>
</RoleGuard>
```

---

## PROMPT 21: API Testing & Validation (60-90 min)

### Key Features
- Test all endpoints with different roles
- Verify multi-org isolation
- Test role-based access control
- Integration testing
- Create Postman collection

### Testing Checklist
- [ ] Auth endpoints (login, refresh, logout)
- [ ] User management (admin only)
- [ ] Patient CRUD (all roles)
- [ ] Appointment CRUD (role-based)
- [ ] Treatment CRUD (role-based)
- [ ] Payment CRUD
- [ ] Expense CRUD
- [ ] Revenue endpoints (admin/dentist only)
- [ ] Settings endpoints (admin only)
- [ ] Multi-org data isolation
- [ ] Token expiration and refresh

---

## PROMPT 22: Production Readiness (45-60 min)

### Key Features
- Environment configuration (.env.production)
- Security hardening (helmet, rate limiting)
- Performance optimization (caching, indexes)
- Logging configuration (Winston)
- Error monitoring (Sentry optional)
- Deployment guide
- Docker setup (optional)

### Security Checklist
- [ ] HTTPS in production
- [ ] Secure cookies
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] SQL injection prevention (using ORM)
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Helmet middleware
- [ ] Environment variables secured

### Deployment Steps
1. Build backend: `npm run build`
2. Run migrations: `npm run migration:up`
3. Build frontend: `npm run build`
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure environment variables
7. Start services with PM2 or Docker

---

## Execution Order

1. **Backend Core** (Prompts 8-13): ~6-7 hours
2. **Backend Advanced** (Prompts 14-16): ~4-5 hours
3. **Frontend Integration** (Prompts 17-20): ~5-6 hours
4. **Testing & Deploy** (Prompts 21-22): ~2-3 hours

**Total**: ~17-21 hours of implementation

---

**Note**: Each prompt should be executed in a fresh conversation for best results. All prompts include multi-org architecture and role-based access control.
