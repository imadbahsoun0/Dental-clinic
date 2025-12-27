# Prompt 20: Role-Based UI Components

## Objective
Implement role-based UI components to conditionally render content based on the current user's role in their selected organization.

## Context
- Prompt 19 completed: Forms validated
- Need to hide/show features based on role
- Dentists see limited features, secretaries more, admins all

## Prerequisites
- Prompt 19 completed
- Auth store has currentOrg with role

## Tasks

### 1. Create RoleGuard Component

**File: `frontend/components/auth/RoleGuard.tsx`**
```typescript
import { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

interface RoleGuardProps {
  roles: ('admin' | 'dentist' | 'secretary')[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { currentOrg } = useAuthStore();

  if (!currentOrg || !roles.includes(currentOrg.role as any)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

### 2. Create PermissionGuard Component

**File: `frontend/components/auth/PermissionGuard.tsx`**
```typescript
import { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

interface PermissionGuardProps {
  permission: 'view' | 'create' | 'edit' | 'delete';
  resource: 'patients' | 'appointments' | 'treatments' | 'payments' | 'expenses' | 'revenue' | 'users' | 'settings';
  children: ReactNode;
  fallback?: ReactNode;
}

const PERMISSIONS = {
  admin: {
    patients: ['view', 'create', 'edit', 'delete'],
    appointments: ['view', 'create', 'edit', 'delete'],
    treatments: ['view', 'create', 'edit', 'delete'],
    payments: ['view', 'create', 'edit', 'delete'],
    expenses: ['view', 'create', 'edit', 'delete'],
    revenue: ['view'],
    users: ['view', 'create', 'edit', 'delete'],
    settings: ['view', 'edit'],
  },
  dentist: {
    patients: ['view'],
    appointments: ['view'], // Own only
    treatments: ['view'], // Own only
    payments: [],
    expenses: [],
    revenue: ['view'], // Own only
    users: [],
    settings: [],
  },
  secretary: {
    patients: ['view', 'create', 'edit'],
    appointments: ['view', 'create', 'edit', 'delete'],
    treatments: ['view', 'create', 'edit'],
    payments: ['view', 'create', 'edit'],
    expenses: ['view', 'create'],
    revenue: [],
    users: [],
    settings: [],
  },
};

export function PermissionGuard({ permission, resource, children, fallback = null }: PermissionGuardProps) {
  const { currentOrg } = useAuthStore();

  if (!currentOrg) {
    return <>{fallback}</>;
  }

  const rolePermissions = PERMISSIONS[currentOrg.role as keyof typeof PERMISSIONS];
  const hasPermission = rolePermissions[resource]?.includes(permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

### 3. Create usePermissions Hook

**File: `frontend/hooks/usePermissions.ts`**
```typescript
import { useAuthStore } from '@/store/authStore';

export function usePermissions() {
  const { currentOrg } = useAuthStore();

  const hasRole = (...roles: string[]) => {
    return currentOrg && roles.includes(currentOrg.role);
  };

  const isAdmin = () => hasRole('admin');
  const isDentist = () => hasRole('dentist');
  const isSecretary = () => hasRole('secretary');

  const canView = (resource: string) => {
    // Implement based on PERMISSIONS object
    return true; // Simplified
  };

  const canCreate = (resource: string) => {
    if (!currentOrg) return false;
    if (currentOrg.role === 'admin') return true;
    if (currentOrg.role === 'secretary') {
      return ['patients', 'appointments', 'treatments', 'payments', 'expenses'].includes(resource);
    }
    return false;
  };

  const canEdit = (resource: string) => {
    return canCreate(resource); // Same logic for now
  };

  const canDelete = (resource: string) => {
    if (!currentOrg) return false;
    if (currentOrg.role === 'admin') return true;
    if (currentOrg.role === 'secretary') {
      return ['appointments'].includes(resource);
    }
    return false;
  };

  return {
    hasRole,
    isAdmin,
    isDentist,
    isSecretary,
    canView,
    canCreate,
    canEdit,
    canDelete,
  };
}
```

### 4. Update Sidebar with Role-Based Navigation

**File: `frontend/components/layout/Sidebar.tsx`** (update)
```typescript
import { RoleGuard } from '@/components/auth/RoleGuard';
import { usePermissions } from '@/hooks/usePermissions';

export function Sidebar() {
  const { isAdmin, isDentist, isSecretary } = usePermissions();

  return (
    <nav className="sidebar">
      <Link href="/dashboard">Dashboard</Link>
      
      <Link href="/patients">Patients</Link>
      
      <Link href="/appointments">
        {isDentist() ? 'My Appointments' : 'Appointments'}
      </Link>
      
      <Link href="/treatments">
        {isDentist() ? 'My Treatments' : 'Treatments'}
      </Link>
      
      <RoleGuard roles={['admin', 'secretary']}>
        <Link href="/payments">Payments</Link>
      </RoleGuard>
      
      <RoleGuard roles={['admin', 'secretary']}>
        <Link href="/expenses">Expenses</Link>
      </RoleGuard>
      
      <RoleGuard roles={['admin', 'dentist']}>
        <Link href="/revenue">
          {isDentist() ? 'My Revenue' : 'Revenue'}
        </Link>
      </RoleGuard>
      
      <RoleGuard roles={['admin']}>
        <Link href="/users">Users</Link>
      </RoleGuard>
      
      <RoleGuard roles={['admin']}>
        <Link href="/settings">Settings</Link>
      </RoleGuard>
    </nav>
  );
}
```

### 5. Update Patient Page with Permission Guards

**File: `frontend/app/patients/page.tsx`** (example)
```typescript
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';

export default function PatientsPage() {
  const { canCreate, canEdit, canDelete } = usePermissions();

  return (
    <div>
      <div className="page-header">
        <h1>Patients</h1>
        
        <PermissionGuard permission="create" resource="patients">
          <button onClick={() => setShowModal(true)}>
            Add Patient
          </button>
        </PermissionGuard>
      </div>

      <table>
        {/* ... */}
        <td>
          <PermissionGuard permission="edit" resource="patients">
            <button onClick={() => handleEdit(patient)}>Edit</button>
          </PermissionGuard>
          
          <PermissionGuard permission="delete" resource="patients">
            <button onClick={() => handleDelete(patient.id)}>Delete</button>
          </PermissionGuard>
        </td>
      </table>
    </div>
  );
}
```

### 6. Update Dashboard with Role-Based Stats

**File: `frontend/app/dashboard/page.tsx`** (update)
```typescript
import { RoleGuard } from '@/components/auth/RoleGuard';
import { usePermissions } from '@/hooks/usePermissions';

export default function Dashboard() {
  const { isDentist, isAdmin } = usePermissions();

  return (
    <div>
      {/* All roles see these */}
      <StatCard title="Today's Appointments" value={appointments.length} />
      <StatCard title="Pending Treatments" value={pendingTreatments.length} />

      {/* Only admin and dentist see revenue */}
      <RoleGuard roles={['admin', 'dentist']}>
        <StatCard 
          title={isDentist() ? "My Revenue" : "Total Revenue"} 
          value={`$${revenue}`} 
        />
      </RoleGuard>

      {/* Only admin sees all stats */}
      <RoleGuard roles={['admin']}>
        <StatCard title="Total Patients" value={totalPatients} />
        <StatCard title="Total Expenses" value={`$${totalExpenses}`} />
      </RoleGuard>
    </div>
  );
}
```

## Acceptance Criteria
- [ ] RoleGuard component created
- [ ] PermissionGuard component created
- [ ] usePermissions hook created
- [ ] Sidebar navigation role-based
- [ ] Patient page buttons guarded
- [ ] Dashboard stats role-based
- [ ] All pages updated
- [ ] Dentists see limited features
- [ ] Secretaries cannot see revenue
- [ ] Admins see everything

## Next Steps
Proceed to **Prompt 21: API Testing**

---
**Estimated Time**: 60-75 minutes
**Difficulty**: Medium
**Dependencies**: Prompt 19
