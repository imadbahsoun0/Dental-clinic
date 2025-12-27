# Prompt 18: Frontend API Integration - Final Integration & Polish

## Objective
Complete the frontend API integration by updating all remaining stores, adding comprehensive error handling, loading states, and ensuring all features work end-to-end with the backend.

## Context
- Prompts 1-17 completed
- **API client has been regenerated after each backend module** (Prompts 6-16)
- You should already have `frontend/lib/api/api.ts` with all endpoints
- Some stores may already be partially updated
- Need to ensure complete integration and polish

## Prerequisites
- Prompts 1-17 completed
- API client generated and up-to-date
- Backend fully functional

## Current State Check

By now, you should have:
- ✅ API client setup (from Prompt 1 or early setup)
- ✅ Generated API types for all modules (from Prompts 6-16)
- ✅ `frontend/lib/api/api.ts` with all endpoints
- ✅ Axios interceptors configured
- ✅ Token refresh logic in place

## Tasks

### 1. Install Toast Library (if not already done)

```bash
cd frontend
npm install react-hot-toast
```

### 2. Add Toast Provider

**File: `frontend/app/layout.tsx`** (update if not already done)
```typescript
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

### 3. Verify API Client is Up-to-Date

```bash
cd frontend
npm run generate:api
```

This ensures you have the latest endpoints from all completed backend modules.

### 4. Review Generated API Structure

Check `frontend/lib/api/api.ts` - you should see:

```typescript
export class Api {
  auth = {
    authControllerLogin: (data: LoginDto) => {...},
    authControllerSelectOrganization: (data: SelectOrganizationDto) => {...},
    authControllerRefresh: () => {...},
    authControllerLogout: () => {...},
  }
  
  users = {
    usersControllerCreate: (data: CreateUserDto) => {...},
    usersControllerFindAll: (params: PaginationDto) => {...},
    // ... more
  }
  
  patients = {
    patientsControllerCreate: (data: CreatePatientDto) => {...},
    patientsControllerFindAll: (params: PaginationDto & FilterDto) => {...},
    // ... more
  }
  
  appointments = { /* ... */ }
  treatments = { /* ... */ }
  payments = { /* ... */ }
  expenses = { /* ... */ }
  settings = { /* ... */ }
  wallet = { /* ... */ }
  analytics = { /* ... */ }
}
```

### 5. Complete Auth Store Integration

**File: `frontend/store/authStore.ts`**

Ensure it's fully integrated with the API (should already be mostly done):

```typescript
import { create } from 'zustand';
import { User, UserOrganization } from '@/types';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthStore {
  currentUser: User | null;
  currentOrg: UserOrganization | null;
  isAuthenticated: boolean;
  needsOrgSelection: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsOrgSelection?: boolean }>;
  selectOrganization: (orgId: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  currentUser: null,
  currentOrg: null,
  isAuthenticated: false,
  needsOrgSelection: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.auth.authControllerLogin({ email, password });
      const { user, needsOrgSelection, accessToken } = response.data;

      localStorage.setItem('dentacare_auth_user', JSON.stringify(user));

      if (needsOrgSelection) {
        set({ currentUser: user, needsOrgSelection: true, isLoading: false });
        return { success: true, needsOrgSelection: true };
      }

      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        const currentOrg = user.organizations?.[0];
        localStorage.setItem('dentacare_current_org', currentOrg.orgId);
        set({
          currentUser: user,
          currentOrg,
          isAuthenticated: true,
          needsOrgSelection: false,
          isLoading: false,
        });
      }

      return { success: true };
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  selectOrganization: async (orgId: string) => {
    const { currentUser } = get();
    if (!currentUser) return { success: false, error: 'No user logged in' };

    try {
      const response = await api.auth.authControllerSelectOrganization({
        orgId,
        userId: currentUser.id,
      });

      const { accessToken, currentOrg } = response.data;
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('dentacare_current_org', orgId);

      set({
        currentUser: { ...currentUser, currentOrg },
        currentOrg,
        isAuthenticated: true,
        needsOrgSelection: false,
      });

      toast.success('Organization selected');
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to select organization';
      toast.error(message);
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await api.auth.authControllerLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('dentacare_auth_user');
      localStorage.removeItem('dentacare_current_org');
      localStorage.removeItem('access_token');
      set({
        currentUser: null,
        currentOrg: null,
        isAuthenticated: false,
        needsOrgSelection: false,
      });
      toast.success('Logged out successfully');
    }
  },

  initializeAuth: () => {
    const storedUser = localStorage.getItem('dentacare_auth_user');
    const storedOrgId = localStorage.getItem('dentacare_current_org');
    const accessToken = localStorage.getItem('access_token');

    if (storedUser && accessToken) {
      const user = JSON.parse(storedUser);
      const currentOrg = user.organizations?.find((org: any) => org.orgId === storedOrgId);

      if (currentOrg) {
        set({ currentUser: user, currentOrg, isAuthenticated: true });
      }
    }
  },
}));
```

### 6. Complete All Store Integrations

For each store, ensure it's using the generated API client. Here's the pattern:

**Patient Store Example:**
```typescript
import { create } from 'zustand';
import { api } from '@/lib/api';
import type { CreatePatientDto, UpdatePatientDto, PatientResponseDto } from '@/lib/api';
import toast from 'react-hot-toast';

interface PatientStore {
  patients: PatientResponseDto[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  
  fetchPatients: (page?: number, limit?: number, search?: string) => Promise<void>;
  addPatient: (patient: CreatePatientDto) => Promise<void>;
  updatePatient: (id: string, patient: UpdatePatientDto) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  searchPatients: (query: string) => Promise<void>;
}

export const usePatientStore = create<PatientStore>()((set) => ({
  patients: [],
  isLoading: false,
  totalPages: 0,
  currentPage: 1,

  fetchPatients: async (page = 1, limit = 10, search = '') => {
    set({ isLoading: true });
    try {
      const response = await api.patients.patientsControllerFindAll({ page, limit, search });
      set({
        patients: response.data.data,
        totalPages: response.data.meta.totalPages,
        currentPage: page,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      toast.error('Failed to fetch patients');
      console.error(error);
    }
  },

  addPatient: async (patient) => {
    try {
      const response = await api.patients.patientsControllerCreate(patient);
      set((state) => ({ patients: [response.data, ...state.patients] }));
      toast.success('Patient created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create patient');
      throw error;
    }
  },

  updatePatient: async (id, patient) => {
    try {
      const response = await api.patients.patientsControllerUpdate(id, patient);
      set((state) => ({
        patients: state.patients.map((p) => (p.id === id ? response.data : p)),
      }));
      toast.success('Patient updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update patient');
      throw error;
    }
  },

  deletePatient: async (id) => {
    try {
      await api.patients.patientsControllerRemove(id);
      set((state) => ({ patients: state.patients.filter((p) => p.id !== id) }));
      toast.success('Patient deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete patient');
      throw error;
    }
  },

  searchPatients: async (query) => {
    set({ isLoading: true });
    try {
      const response = await api.patients.patientsControllerSearch({ q: query });
      set({ patients: response.data, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      toast.error('Search failed');
      console.error(error);
    }
  },
}));
```

### 7. Update All Remaining Stores

Apply the same pattern to:

- ✅ `appointmentStore.ts` - Use `api.appointments.*`
- ✅ `treatmentStore.ts` - Use `api.treatments.*`
- ✅ `paymentStore.ts` - Use `api.payments.*`
- ✅ `expenseStore.ts` - Use `api.expenses.*`
- ✅ `settingsStore.ts` - Use `api.settings.*`

### 8. Add Loading Indicators to Components

**Example: Patient Page**
```typescript
export default function PatientsPage() {
  const { patients, isLoading, fetchPatients } = usePatientStore();

  useEffect(() => {
    fetchPatients();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Patient list */}
    </div>
  );
}
```

### 9. Test End-to-End Flow

1. **Login Flow**
   - Login with single-org user → Dashboard
   - Login with multi-org user → Org selector → Dashboard

2. **CRUD Operations**
   - Create patient → Toast success → List updates
   - Update patient → Toast success → List updates
   - Delete patient → Toast success → Removed from list

3. **Error Handling**
   - Invalid login → Toast error
   - Network error → Toast error
   - Validation error → Toast error with message

4. **Token Refresh**
   - Wait for token expiration
   - Make API call → Auto-refresh → Request succeeds

### 10. Remove Dummy Data (Optional)

If you want to fully remove dummy data:

```typescript
// Remove or comment out dummy data imports
// import { dummyPatients } from '@/data/dummyData';

// Initialize with empty arrays
export const usePatientStore = create<PatientStore>()((set) => ({
  patients: [], // Was: dummyPatients
  // ...
}));
```

## Acceptance Criteria

- [ ] All stores using generated API client
- [ ] Toast notifications working
- [ ] Loading states showing
- [ ] Error messages displaying
- [ ] Token refresh working
- [ ] Login flow complete
- [ ] CRUD operations working
- [ ] Multi-org selection working
- [ ] Type safety throughout
- [ ] No TypeScript errors

## Testing Checklist

- [ ] Login as admin → See all features
- [ ] Login as dentist → See limited features
- [ ] Login as secretary → Cannot see revenue
- [ ] Create/edit/delete patient
- [ ] Create/edit/delete appointment
- [ ] Create/edit treatment
- [ ] View revenue (role-based)
- [ ] Token expires → Auto-refresh
- [ ] Logout → Redirect to login

## Common Issues

### Issue: API calls fail with 404
**Solution**: Ensure backend is running and API client is regenerated

### Issue: Type errors in stores
**Solution**: Regenerate API client: `npm run generate:api`

### Issue: Token not refreshing
**Solution**: Check axios interceptor in `lib/api/config.ts`

### Issue: CORS errors
**Solution**: Check backend CORS configuration

## Next Steps

Proceed to **Prompt 19: Form Validation**

---
**Estimated Time**: 60-90 minutes
**Difficulty**: Medium
**Dependencies**: Prompts 1-17

**Note**: Since you've been generating the API client after each backend module, this prompt focuses on completing the integration, adding polish, and ensuring everything works end-to-end rather than starting from scratch.
