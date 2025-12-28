# Prompt 5: Role-Based Access Control (RBAC) Guards

## Objective
Implement role-based access control with custom guards and decorators to enforce permissions based on user roles within their current organization.

## Context
- Prompt 4 completed: Authentication module with JWT working
- Users have roles per organization (admin, dentist, secretary)
- Need to restrict API access based on roles
- CurrentUser decorator provides orgId and role from JWT

## Prerequisites
- Prompts 1-4 completed successfully
- Authentication working
- JWT tokens include orgId and role

## Tasks

### 1. Update Roles Decorator

**File: `src/common/decorators/roles.decorator.ts`** (already exists, verify):
```typescript
import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  ADMIN = 'admin',
  DENTIST = 'dentist',
  SECRETARY = 'secretary',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

### 2. Create Roles Guard

**File: `src/common/guards/roles.guard.ts`**
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';
import { CurrentUserData } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUserData = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role}`,
      );
    }

    return true;
  }
}
```

### 3. Create Organization Scope Guard

**File: `src/common/guards/org-scope.guard.ts`**
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CurrentUserData } from '../decorators/current-user.decorator';

/**
 * Guard to ensure user can only access data from their current organization
 * This is automatically applied by checking orgId in queries
 */
@Injectable()
export class OrgScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: CurrentUserData = request.user;

    if (!user || !user.orgId) {
      throw new ForbiddenException('Organization context not found');
    }

    // Add orgId to request for easy access in services
    request.orgId = user.orgId;

    return true;
  }
}
```

### 4. Create Resource Owner Guard

**File: `src/common/guards/resource-owner.guard.ts`**
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CurrentUserData } from '../decorators/current-user.decorator';
import { UserRole } from '../decorators/roles.decorator';

/**
 * Guard to check if user owns the resource or has admin role
 * Used for endpoints like "get my appointments", "get my revenue"
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: CurrentUserData = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admins can access all resources
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // For other roles, check if they're accessing their own resources
    // This will be validated in the service layer
    return true;
  }
}
```

### 5. Create Permission Decorator

**File: `src/common/decorators/permissions.decorator.ts`**
```typescript
import { SetMetadata } from '@nestjs/common';

export enum Permission {
  // Patient permissions
  VIEW_PATIENTS = 'view_patients',
  CREATE_PATIENT = 'create_patient',
  UPDATE_PATIENT = 'update_patient',
  DELETE_PATIENT = 'delete_patient',

  // Appointment permissions
  VIEW_APPOINTMENTS = 'view_appointments',
  VIEW_OWN_APPOINTMENTS = 'view_own_appointments',
  CREATE_APPOINTMENT = 'create_appointment',
  UPDATE_APPOINTMENT = 'update_appointment',
  DELETE_APPOINTMENT = 'delete_appointment',

  // Treatment permissions
  VIEW_TREATMENTS = 'view_treatments',
  VIEW_OWN_TREATMENTS = 'view_own_treatments',
  CREATE_TREATMENT = 'create_treatment',
  UPDATE_TREATMENT = 'update_treatment',
  DELETE_TREATMENT = 'delete_treatment',

  // Payment permissions
  VIEW_PAYMENTS = 'view_payments',
  CREATE_PAYMENT = 'create_payment',
  UPDATE_PAYMENT = 'update_payment',
  DELETE_PAYMENT = 'delete_payment',

  // Expense permissions
  VIEW_EXPENSES = 'view_expenses',
  CREATE_EXPENSE = 'create_expense',
  UPDATE_EXPENSE = 'update_expense',
  DELETE_EXPENSE = 'delete_expense',

  // Revenue permissions
  VIEW_REVENUE = 'view_revenue',
  VIEW_OWN_REVENUE = 'view_own_revenue',
  VIEW_ALL_REVENUE = 'view_all_revenue',

  // User management permissions
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',

  // Settings permissions
  VIEW_SETTINGS = 'view_settings',
  UPDATE_SETTINGS = 'update_settings',
}

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

### 6. Create Role-Permission Mapping

**File: `src/common/config/role-permissions.config.ts`**
```typescript
import { UserRole } from '../decorators/roles.decorator';
import { Permission } from '../decorators/permissions.decorator';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin has all permissions
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENT,
    Permission.UPDATE_PATIENT,
    Permission.DELETE_PATIENT,
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT,
    Permission.DELETE_APPOINTMENT,
    Permission.VIEW_TREATMENTS,
    Permission.CREATE_TREATMENT,
    Permission.UPDATE_TREATMENT,
    Permission.DELETE_TREATMENT,
    Permission.VIEW_PAYMENTS,
    Permission.CREATE_PAYMENT,
    Permission.UPDATE_PAYMENT,
    Permission.DELETE_PAYMENT,
    Permission.VIEW_EXPENSES,
    Permission.CREATE_EXPENSE,
    Permission.UPDATE_EXPENSE,
    Permission.DELETE_EXPENSE,
    Permission.VIEW_ALL_REVENUE,
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.VIEW_SETTINGS,
    Permission.UPDATE_SETTINGS,
  ],

  [UserRole.DENTIST]: [
    // Dentist can view patients
    Permission.VIEW_PATIENTS,
    // Dentist can only view/manage their own appointments
    Permission.VIEW_OWN_APPOINTMENTS,
    // Dentist can only view/manage their own treatments
    Permission.VIEW_OWN_TREATMENTS,
    // Dentist can view their own revenue
    Permission.VIEW_OWN_REVENUE,
  ],

  [UserRole.SECRETARY]: [
    // Secretary can manage patients
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENT,
    Permission.UPDATE_PATIENT,
    // Secretary can manage all appointments
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT,
    Permission.DELETE_APPOINTMENT,
    // Secretary can manage all treatments
    Permission.VIEW_TREATMENTS,
    Permission.CREATE_TREATMENT,
    Permission.UPDATE_TREATMENT,
    // Secretary can manage payments
    Permission.VIEW_PAYMENTS,
    Permission.CREATE_PAYMENT,
    Permission.UPDATE_PAYMENT,
    // Secretary can manage expenses
    Permission.VIEW_EXPENSES,
    Permission.CREATE_EXPENSE,
    // Secretary CANNOT view revenue
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}
```

### 7. Create Permissions Guard

**File: `src/common/guards/permissions.guard.ts`**
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, Permission } from '../decorators/permissions.decorator';
import { CurrentUserData } from '../decorators/current-user.decorator';
import { hasAllPermissions } from '../config/role-permissions.config';
import { UserRole } from '../decorators/roles.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUserData = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRole = user.role as UserRole;
    const hasRequiredPermissions = hasAllPermissions(userRole, requiredPermissions);

    if (!hasRequiredPermissions) {
      throw new ForbiddenException(
        `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
```

### 8. Update App Module with Guards

**File: `src/app.module.ts`** (update):
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mikroOrmConfig from './mikro-orm.config';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Applied first
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Applied second
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard, // Applied third
    },
  ],
})
export class AppModule {}
```

### 9. Create Example Protected Controller

**File: `src/modules/test/test.controller.ts`** (for testing):
```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { RequirePermissions, Permission } from '../../common/decorators/permissions.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';

@ApiTags('Test')
@ApiBearerAuth('JWT-auth')
@Controller('test')
export class TestController {
  @Get('admin-only')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin only endpoint' })
  @ApiStandardResponse(Object)
  adminOnly(@CurrentUser() user: CurrentUserData) {
    return new StandardResponse({
      message: 'Admin access granted',
      user,
    });
  }

  @Get('dentist-or-admin')
  @Roles(UserRole.DENTIST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Dentist or Admin endpoint' })
  @ApiStandardResponse(Object)
  dentistOrAdmin(@CurrentUser() user: CurrentUserData) {
    return new StandardResponse({
      message: 'Dentist or Admin access granted',
      user,
    });
  }

  @Get('view-revenue')
  @RequirePermissions(Permission.VIEW_REVENUE)
  @ApiOperation({ summary: 'View revenue (permission-based)' })
  @ApiStandardResponse(Object)
  viewRevenue(@CurrentUser() user: CurrentUserData) {
    return new StandardResponse({
      message: 'Revenue access granted',
      user,
    });
  }

  @Get('current-user')
  @ApiOperation({ summary: 'Get current user info' })
  @ApiStandardResponse(Object)
  getCurrentUser(@CurrentUser() user: CurrentUserData) {
    return new StandardResponse(user);
  }
}
```

### 10. Create Test Module

**File: `src/modules/test/test.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { TestController } from './test.controller';

@Module({
  controllers: [TestController],
})
export class TestModule {}
```

### 11. Update App Module to Include Test Module

**File: `src/app.module.ts`** (add TestModule):
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mikroOrmConfig from './mikro-orm.config';
import { AuthModule } from './modules/auth/auth.module';
import { TestModule } from './modules/test/test.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    AuthModule,
    TestModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
```

### 12. Generate API Client

Run the following command in the `frontend` directory to update the API client with the new endpoints:

```bash
cd frontend
npm run generate:api
```

## Acceptance Criteria

- [ ] Roles guard created and working
- [ ] Permissions guard created and working
- [ ] Role-permission mapping defined
- [ ] Guards applied globally
- [ ] Test endpoints created
- [ ] Admin-only endpoints protected
- [ ] Dentist can only access own data
- [ ] Secretary cannot access revenue
- [ ] Swagger shows role requirements
- [ ] No TypeScript compilation errors

## Testing Steps

1. **Login as Admin**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"james.wilson@dentalclinic.com","password":"password123"}'
   ```

2. **Test admin-only endpoint**:
   ```bash
   curl -X GET http://localhost:3000/api/v1/test/admin-only \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```
   Should succeed

3. **Login as Dentist**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"sarah.smith@dentalclinic.com","password":"password123"}'
   ```

4. **Test admin-only endpoint with dentist token**:
   ```bash
   curl -X GET http://localhost:3000/api/v1/test/admin-only \
     -H "Authorization: Bearer DENTIST_TOKEN"
   ```
   Should fail with 403

5. **Test dentist-or-admin endpoint with dentist token**:
   ```bash
   curl -X GET http://localhost:3000/api/v1/test/dentist-or-admin \
     -H "Authorization: Bearer DENTIST_TOKEN"
   ```
   Should succeed

6. **Login as Secretary**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"emily.davis@dentalclinic.com","password":"password123"}'
   ```

7. **Test revenue endpoint with secretary token**:
   ```bash
   curl -X GET http://localhost:3000/api/v1/test/view-revenue \
     -H "Authorization: Bearer SECRETARY_TOKEN"
   ```
   Should fail with 403

## Files Created

```
src/common/guards/
├── jwt-auth.guard.ts (already exists)
├── roles.guard.ts
├── permissions.guard.ts
├── org-scope.guard.ts
└── resource-owner.guard.ts

src/common/decorators/
├── roles.decorator.ts (already exists)
└── permissions.decorator.ts

src/common/config/
└── role-permissions.config.ts

src/modules/test/
├── test.module.ts
└── test.controller.ts
```

## Common Issues & Solutions

1. **Guards not working**: Check guard order in app.module.ts
2. **403 errors**: Verify user role in JWT token
3. **Permissions not enforced**: Check role-permissions mapping

## Next Steps

After completing this prompt:
- Proceed to **Prompt 6: User Management APIs**
- Do not proceed until all acceptance criteria are met
- Test module can be removed after testing

## Notes

- Guards are applied in order: JWT → Roles → Permissions
- Admin role has all permissions
- Dentist can only access own data (enforced in services)
- Secretary cannot view revenue
- Permissions are more granular than roles

---

**Estimated Time**: 30-45 minutes
**Difficulty**: Medium
**Dependencies**: Prompts 1, 2, 3, 4
