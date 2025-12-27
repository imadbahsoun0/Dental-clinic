# Multi-Organization Architecture Update

## Overview
The authentication system has been updated to support users belonging to multiple organizations with different roles in each organization. This is a more flexible and scalable approach for a SaaS application.

## What Changed

### Database Schema

#### Before (Single Org per User)
```
users table:
- id
- name
- email
- password
- role (single role)
- status
- wallet
- percentage
- orgId (single organization)
```

#### After (Multi-Org Support)
```
users table:
- id
- name
- email
- password
- refreshToken
- refreshTokenExpiresAt
(NO orgId, NO role, NO status - these moved to junction table)

user_organizations table (NEW):
- id
- userId (FK to users)
- orgId (FK to organizations)
- role (role in THIS organization)
- status (status in THIS organization)
- wallet (wallet for THIS organization)
- percentage (commission for THIS organization)
- createdAt
- updatedAt
- createdBy
- updatedBy
```

### Key Benefits

1. **Flexibility**: Users can work in multiple organizations
2. **Role Separation**: Different roles in different organizations (e.g., dentist in one, admin in another)
3. **Wallet Isolation**: Separate wallet and commission per organization
4. **True Multi-Tenancy**: Better data isolation and organization management

## Frontend Changes

### 1. Updated Types (`frontend/types/index.ts`)

```typescript
// NEW: Junction table representation
export interface UserOrganization {
  id: string;
  userId: string;
  orgId: string;
  role: 'dentist' | 'secretary' | 'admin';
  status: 'active' | 'inactive';
  wallet?: number;
  percentage?: number;
  createdAt: string;
  updatedAt: string;
}

// UPDATED: User now has organizations array
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
  organizations?: UserOrganization[]; // NEW
  currentOrg?: UserOrganization; // NEW - selected org
}
```

### 2. Updated Auth Store (`frontend/store/authStore.ts`)

**New State:**
```typescript
interface AuthStore {
  currentUser: User | null;
  currentOrg: UserOrganization | null; // NEW
  isAuthenticated: boolean;
  needsOrgSelection: boolean; // NEW
  login: (email, password) => Promise<...>;
  selectOrganization: (orgId) => Promise<...>; // NEW
  logout: () => void;
  initializeAuth: () => void;
}
```

**New Login Flow:**
1. User enters email/password
2. System validates credentials
3. If user has 1 org → auto-select and go to dashboard
4. If user has multiple orgs → redirect to organization selector
5. User selects organization
6. System sets currentOrg and redirects to dashboard

### 3. New Components

**`frontend/components/auth/OrganizationSelector.tsx`**
- Displays list of user's organizations
- Shows role badge for each org
- Shows commission percentage for dentist roles
- Allows user to select which org to work in

**`frontend/app/select-organization/page.tsx`**
- Page wrapper for OrganizationSelector component

### 4. Updated Login Page (`frontend/app/login/page.tsx`)

- Checks for `needsOrgSelection` flag
- Redirects to `/select-organization` if user has multiple orgs
- Redirects to `/dashboard` if user has single org

### 5. Updated Dummy Data (`frontend/data/dummyData.ts`)

- All users now have `organizations` array
- Added example user (Dr. Alex Martinez) with multiple organizations
- Each organization membership includes role, status, wallet, percentage

## Backend Changes (Prompts Updated)

### Prompt 3: Database Entities

**Updated Entities:**

1. **User Entity** (`user.entity.ts`)
   - Removed: role, status, wallet, percentage, orgId
   - Added: OneToMany relationship to UserOrganization
   - Email is globally unique (not per org)

2. **UserOrganization Entity** (`user-organization.entity.ts`) - NEW
   - Junction table between User and Organization
   - Contains: role, status, wallet, percentage per org
   - Unique constraint on (userId, orgId)
   - Has orgId for multi-tenancy

3. **Organization Entity** (unchanged)
   - Remains the same

## Authentication Flow

### Login Process

```
1. POST /auth/login { email, password }
   ↓
2. Validate credentials
   ↓
3. Fetch user with organizations
   ↓
4. Filter active organizations
   ↓
5a. If 1 org → Return JWT with orgId
    ↓
    Dashboard
   
5b. If multiple orgs → Return user data
    ↓
    Organization Selector Page
    ↓
6. POST /auth/select-organization { orgId }
   ↓
7. Return JWT with selected orgId
   ↓
   Dashboard
```

### JWT Token Structure

```typescript
{
  sub: userId,
  email: userEmail,
  orgId: selectedOrgId,
  role: roleInSelectedOrg,
  iat: issuedAt,
  exp: expiresAt
}
```

## API Changes

### Authentication Endpoints

```typescript
// Login - returns user with organizations
POST /auth/login
Body: { email, password }
Response: {
  user: User,
  needsOrgSelection: boolean,
  accessToken?: string, // Only if single org
  // refreshToken set in HTTP-only cookie
}

// Select Organization - for multi-org users
POST /auth/select-organization
Body: { orgId }
Response: {
  accessToken: string,
  currentOrg: UserOrganization
  // refreshToken set in HTTP-only cookie
}

// Refresh Token
POST /auth/refresh
Response: {
  accessToken: string
}

// Logout
POST /auth/logout
```

### Protected Endpoints

All protected endpoints now use `currentOrg` from JWT:
- `req.user.orgId` - from JWT token
- `req.user.role` - role in current organization
- `req.user.id` - user ID

## Migration Strategy

### For Existing Data

If you have existing data with the old schema:

```sql
-- 1. Create user_organizations table
-- 2. Migrate existing user data
INSERT INTO user_organizations (id, user_id, org_id, role, status, wallet, percentage)
SELECT 
  gen_random_uuid(),
  id,
  org_id,
  role,
  status,
  wallet,
  percentage
FROM users;

-- 3. Remove columns from users table
ALTER TABLE users 
  DROP COLUMN role,
  DROP COLUMN status,
  DROP COLUMN wallet,
  DROP COLUMN percentage,
  DROP COLUMN org_id;

-- 4. Make email globally unique
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
```

## Role-Based Access Control

### Accessing Current Organization

```typescript
// In controllers
@Get()
async getMyData(@CurrentUser() user: CurrentUserData) {
  // user.orgId - current organization
  // user.role - role in current organization
  // user.id - user ID
  
  return this.service.findByOrg(user.orgId);
}
```

### Switching Organizations

Users can switch organizations by:
1. Logging out
2. Logging back in
3. Selecting different organization

OR (future enhancement):
- Add "Switch Organization" feature in UI
- Call `/auth/select-organization` with new orgId
- Get new JWT token with new orgId

## Testing the Changes

### Test Scenarios

1. **Single Org User (Dr. Sarah Smith)**
   - Email: sarah.smith@dentalclinic.com
   - Password: password123
   - Expected: Direct login to dashboard
   - Role: Dentist in org-1

2. **Multi-Org User (Dr. Alex Martinez)**
   - Email: alex.martinez@dentalclinic.com
   - Password: password123
   - Expected: Redirect to organization selector
   - Organizations:
     - org-1: Dentist role (40% commission)
     - org-2: Admin role

3. **Secretary (Emily Davis)**
   - Email: emily.davis@dentalclinic.com
   - Password: password123
   - Expected: Direct login to dashboard
   - Role: Secretary in org-1

## Future Enhancements

1. **Organization Switching**
   - Add dropdown in header to switch organizations
   - No need to logout/login

2. **Organization Management**
   - Admin can invite users to organization
   - Admin can set user roles per organization
   - Admin can manage user status per organization

3. **Cross-Organization Reporting**
   - For users with admin role in multiple orgs
   - Consolidated reports across organizations

## Files Modified

### Frontend
- ✅ `frontend/types/index.ts` - Added UserOrganization interface
- ✅ `frontend/store/authStore.ts` - Multi-org authentication logic
- ✅ `frontend/data/dummyData.ts` - Updated user data structure
- ✅ `frontend/app/login/page.tsx` - Organization selection flow
- ✅ `frontend/components/auth/OrganizationSelector.tsx` - NEW
- ✅ `frontend/app/select-organization/page.tsx` - NEW

### Backend (Prompts)
- ✅ `prompts/PROMPT_03_ENTITIES_MIGRATIONS.md` - Updated entities

### Documentation
- ✅ This file - Architecture documentation

## Summary

The multi-organization architecture provides:
- ✅ **Scalability**: Users can belong to unlimited organizations
- ✅ **Flexibility**: Different roles per organization
- ✅ **Isolation**: Separate wallets and commissions per organization
- ✅ **Security**: Proper JWT-based organization context
- ✅ **User Experience**: Seamless organization selection
- ✅ **Data Integrity**: Proper foreign key relationships

This architecture is production-ready and follows SaaS best practices!

---

**Last Updated**: 2025-12-27
**Version**: 2.0 (Multi-Org)
