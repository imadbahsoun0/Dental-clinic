# Backend Implementation Plan - Dental Clinic Management System

## Overview
This document outlines the comprehensive implementation plan for building a NestJS-based backend system for the Dental Clinic Management application. The implementation is divided into incremental, manageable prompts that can be executed independently.

## Technology Stack
- **Framework**: NestJS (Latest LTS)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: MikroORM
- **Authentication**: OAuth2 with JWT (Access + Refresh tokens)
- **API Documentation**: Swagger
- **Validation**: class-validator
- **Queue**: AWS SQS
- **Email**: Gmail SMTP (future: AWS SES)
- **WhatsApp**: WAHA service
- **Frontend**: React + Next.js with React Hook Form

## Architecture Overview

### Microservices
1. **API Service** - Main REST API handling all business logic
2. **Notification Service** - Handles WhatsApp and email notifications via queue

### Database Schema (Multi-tenant SaaS)
All entities will be scoped to an organization (org_id) for multi-tenancy support.

## Key Requirements Summary

### Authentication & Authorization
- OAuth2 with JWT (access + refresh tokens)
- Secure HTTP-only cookies
- Token revocation support
- Role-based access control (RBAC)
- Roles: Admin, Dentist, Secretary

### Role Permissions
- **Admin**: Full access to all APIs
- **Dentist**: Access to own appointments, treatments, and revenue
- **Secretary**: Access to all appointments/treatments, can create appointments/treatments, add expenses, add payments, NO access to revenue

### Multi-tenancy (SaaS)
- Organization table (manually created)
- First admin user created manually per org
- All subsequent users added by admin under same org
- All data scoped to organization

### Data Requirements
- All entities: createdAt, updatedAt, createdBy, updatedBy
- Proper indexing for large datasets
- Audit trail support

### API Features
- Standardized request/response DTOs
- User context from JWT (no need to send user ID from frontend)
- Generic filtering and pagination
- Comprehensive exception handling
- Request/response logging (optional)
- Custom Swagger decorators for standardized responses

### Notifications
- WhatsApp reminders via WAHA service
- Email notifications via Gmail SMTP
- Queue-based processing (AWS SQS)
- Two types: Appointment reminders, Payment reminders

## Implementation Phases

### Phase 1: Project Setup & Core Infrastructure (Prompts 1-3)
- Prompt 1: NestJS project initialization with MikroORM
- Prompt 2: Common module setup (decorators, filters, interceptors, DTOs)
- Prompt 3: Database entities and migrations

### Phase 2: Authentication & Authorization (Prompts 4-6)
- Prompt 4: Auth module with JWT strategy
- Prompt 5: Role-based guards and decorators
- Prompt 6: User management APIs

### Phase 3: Core Business Modules (Prompts 7-13)
- Prompt 7: Organization & multi-tenancy setup
- Prompt 8: Patient module
- Prompt 9: Appointment module
- Prompt 10: Treatment module
- Prompt 11: Payment module
- Prompt 12: Expense module
- Prompt 13: Settings module (appointment types, medical history, clinic branding)

### Phase 4: Advanced Features (Prompts 14-16)
- Prompt 14: Doctor wallet & commission system
- Prompt 15: Revenue & analytics APIs
- Prompt 16: Notification service (microservice)

### Phase 5: Integration & Frontend (Prompts 17-20)
- Prompt 17: Swagger client generation for frontend
- Prompt 18: Frontend API client integration
- Prompt 19: Frontend form validation with React Hook Form
- Prompt 20: Role-based UI components

### Phase 6: Testing & Deployment (Prompts 21-22)
- Prompt 21: API testing and validation
- Prompt 22: Production readiness checklist

## Detailed Prompt Breakdown

Each prompt file will contain:
1. **Objective**: Clear goal for the prompt
2. **Context**: What has been completed in previous prompts
3. **Tasks**: Specific implementation tasks
4. **Acceptance Criteria**: How to verify completion
5. **Files to Create/Modify**: Explicit list
6. **Testing Steps**: How to test the implementation

## Execution Guidelines

1. **Sequential Execution**: Execute prompts in order (1-22)
2. **Fresh Context**: Each prompt should be executed in a fresh conversation
3. **Verification**: Complete acceptance criteria before moving to next prompt
4. **Documentation**: Update this plan if deviations occur
5. **Git Commits**: Commit after each successful prompt completion

## Dependencies Between Prompts

```
Prompt 1 (Setup)
  ↓
Prompt 2 (Common)
  ↓
Prompt 3 (Entities)
  ↓
Prompt 4-6 (Auth) ← Must complete before business modules
  ↓
Prompt 7 (Org) ← Foundation for multi-tenancy
  ↓
Prompts 8-13 (Business Modules) ← Can be done in parallel after Prompt 7
  ↓
Prompts 14-15 (Advanced Features)
  ↓
Prompt 16 (Notification Service) ← Separate microservice
  ↓
Prompts 17-20 (Frontend Integration)
  ↓
Prompts 21-22 (Testing & Deployment)
```

## Success Metrics

- [ ] All APIs documented in Swagger
- [ ] All endpoints protected with proper authentication
- [ ] Role-based access control working correctly
- [ ] Multi-tenancy isolation verified
- [ ] Frontend successfully consuming APIs
- [ ] Form validation working on frontend
- [ ] Role-based UI rendering correctly
- [ ] Notifications sending successfully
- [ ] Database migrations working
- [ ] Production-ready configuration

## Notes

- Use Context7 for any library documentation needs
- All prompts should be self-contained
- Each prompt should be completable in one session
- Test thoroughly before moving to next prompt
- Keep frontend and backend in sync

---

**Last Updated**: 2025-12-27
**Version**: 1.0
