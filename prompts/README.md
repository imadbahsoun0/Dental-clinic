# Dental Clinic Management System - Implementation Prompts

Welcome to the implementation prompts directory! This folder contains 22 detailed, step-by-step prompts to build a complete NestJS backend for the Dental Clinic Management System.

## 🎯 Quick Start

1. **Read the Implementation Plan**: Start with `../IMPLEMENTATION_PLAN.md`
2. **Review the Index**: Check `INDEX.md` for the complete prompt list
3. **Execute Sequentially**: Follow prompts 1-22 in order
4. **Fresh Context**: Start each prompt in a new conversation
5. **Track Progress**: Update the status in `INDEX.md` as you go

## 📋 What's Included

### Phase 1: Foundation (Prompts 1-3)
- Project setup with NestJS and MikroORM
- Common utilities (decorators, filters, interceptors)
- Database entities and migrations

### Phase 2: Security (Prompts 4-6)
- JWT authentication with OAuth2
- Role-based access control (RBAC)
- User management

### Phase 3: Core Features (Prompts 7-13)
- Multi-tenant organization setup
- Patient, appointment, and treatment management
- Payment and expense tracking
- Settings and configuration

### Phase 4: Advanced (Prompts 14-16)
- Doctor wallet and commission system
- Revenue and analytics
- Notification service (WhatsApp + Email)

### Phase 5: Frontend (Prompts 17-20)
- Swagger client generation
- API integration
- Form validation with React Hook Form
- Role-based UI components

### Phase 6: Deployment (Prompts 21-22)
- Testing and validation
- Production readiness

## 🏗️ Architecture Overview

```
Backend Architecture:
├── API Service (NestJS)
│   ├── Authentication & Authorization
│   ├── Multi-tenant Data Isolation
│   ├── Business Logic Modules
│   └── RESTful APIs
│
└── Notification Service (NestJS)
    ├── Queue Consumer (AWS SQS)
    ├── WhatsApp Integration (WAHA)
    └── Email Integration (SMTP)
```

## 🔑 Key Features

- **Multi-tenancy**: Organization-based data isolation
- **Authentication**: OAuth2 with JWT (access + refresh tokens)
- **Authorization**: Role-based access control (Admin, Dentist, Secretary)
- **Security**: HTTP-only cookies, token revocation
- **Validation**: class-validator with custom pipes
- **Documentation**: Auto-generated Swagger with custom decorators
- **Logging**: Request/response logging (optional)
- **Error Handling**: Standardized error responses
- **Pagination**: Generic pagination support
- **Filtering**: Generic filtering support
- **Audit Trail**: createdAt, updatedAt, createdBy, updatedBy
- **Notifications**: WhatsApp and email via queue

## 📊 Database Schema

All entities include:
- `id` (UUID)
- `orgId` (UUID) - Multi-tenancy
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `createdBy` (UUID)
- `updatedBy` (UUID)

### Core Entities
1. **Organization** - Tenant isolation
2. **User** - Admin, Dentist, Secretary
3. **Patient** - Patient information
4. **Appointment** - Scheduled appointments
5. **Treatment** - Treatment records
6. **Payment** - Payment transactions
7. **Expense** - Expense tracking
8. **AppointmentType** - Treatment types and pricing
9. **TreatmentCategory** - Treatment categories
10. **MedicalHistoryQuestion** - Configurable questions
11. **NotificationSettings** - WhatsApp/Email templates

## 🔐 Role Permissions

### Admin
- Full access to all APIs
- User management
- Organization settings
- All reports and analytics

### Dentist
- Own appointments only
- Own treatments only
- Own revenue only
- Cannot see other dentists' data

### Secretary
- All appointments (read/write)
- All treatments (read/write)
- All patients (read/write)
- Add expenses
- Add payments
- **NO** access to revenue/analytics

## 🚀 Technology Stack

- **Framework**: NestJS (Latest LTS)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: MikroORM
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Authentication**: JWT + Passport
- **Queue**: AWS SQS
- **Email**: Nodemailer (Gmail SMTP)
- **WhatsApp**: WAHA Service

## 📝 Prompt Structure

Each prompt follows this structure:

```markdown
# Prompt X: Title

## Objective
Clear goal for this prompt

## Context
What's been completed, what's the current state

## Prerequisites
What must be done before starting

## Tasks
Step-by-step implementation tasks

## Acceptance Criteria
Checklist to verify completion

## Testing Steps
How to test the implementation

## Files to Create/Modify
Explicit list of files

## Common Issues & Solutions
Troubleshooting guide

## Next Steps
What comes next
```

## ⏱️ Time Estimates

- **Total Backend**: ~16-20 hours
- **Frontend Integration**: ~4-6 hours
- **Testing & Deployment**: ~2-3 hours
- **Grand Total**: ~22-29 hours

## 📖 How to Use

### For Each Prompt:

1. **Open the prompt file** (e.g., `PROMPT_01_PROJECT_SETUP.md`)
2. **Read the entire prompt** before starting
3. **Check prerequisites** are met
4. **Follow tasks sequentially**
5. **Complete acceptance criteria**
6. **Run testing steps**
7. **Commit your changes**
8. **Update INDEX.md** with status
9. **Move to next prompt**

### Best Practices:

- ✅ Execute prompts in order
- ✅ Use fresh context for each prompt
- ✅ Test thoroughly before proceeding
- ✅ Commit after each prompt
- ✅ Update progress in INDEX.md
- ❌ Don't skip prompts
- ❌ Don't modify completed code without testing
- ❌ Don't proceed if acceptance criteria aren't met

## 🐛 Troubleshooting

If you encounter issues:

1. Check the prompt's "Common Issues & Solutions"
2. Verify all prerequisites are met
3. Review previous prompts for missed steps
4. Check the dependencies graph in INDEX.md
5. Ensure environment variables are set correctly

## 📚 Additional Resources

- **Implementation Plan**: `../IMPLEMENTATION_PLAN.md`
- **Prompt Index**: `INDEX.md`
- **Frontend Code**: `../frontend/`
- **Context7**: Use for library documentation

## 🎯 Success Criteria

The implementation is complete when:

- [ ] All 22 prompts executed successfully
- [ ] All APIs documented in Swagger
- [ ] Authentication and authorization working
- [ ] Multi-tenancy verified
- [ ] Frontend consuming APIs correctly
- [ ] Form validation working
- [ ] Role-based UI rendering
- [ ] Notifications sending
- [ ] Production-ready configuration

## 📞 Support

For questions or issues:
1. Review the specific prompt's documentation
2. Check the implementation plan
3. Verify dependencies are met
4. Use Context7 for library-specific questions

## 🔄 Version Control

Recommended git workflow:

```bash
# After each prompt
git add .
git commit -m "feat: completed prompt X - [description]"

# After each phase
git tag -a "phase-X-complete" -m "Completed Phase X"
```

## 📅 Created

**Date**: 2025-12-27
**Version**: 1.0
**Author**: Implementation Plan Generator

---

**Ready to start?** Open `PROMPT_01_PROJECT_SETUP.md` and begin your journey! 🚀
