# API Client Generation - Standard Procedure

## Overview
After completing each backend module, we'll regenerate the TypeScript API client to ensure the frontend has the latest types and endpoints.

## Setup (One-time - Add to Prompt 1)

### 1. Install swagger-typescript-api

**In frontend project:**
```bash
cd frontend
npm install --save-dev swagger-typescript-api
```

### 2. Add Generation Script

**File: `frontend/package.json`**
```json
{
  "scripts": {
    "generate:api": "swagger-typescript-api -p http://localhost:3000/api/docs-json -o ./lib/api -n api.ts --axios --unwrap-response-data",
    "dev": "next dev",
    "build": "next build"
  }
}
```

### 3. Create API Configuration (One-time)

**File: `frontend/lib/api/config.ts`**
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        localStorage.setItem('access_token', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
```

**File: `frontend/lib/api/index.ts`**
```typescript
import { Api } from './api';
import { apiClient } from './config';

export const api = new Api({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  instance: apiClient,
});

export * from './api';
```

## Standard Procedure After Each Backend Module

### Step 1: Ensure Backend is Running
```bash
cd backend/api
npm run start:dev
```

### Step 2: Verify Swagger is Accessible
Open browser: `http://localhost:3000/api/docs`

### Step 3: Generate API Client
```bash
cd frontend
npm run generate:api
```

This will:
- Fetch the latest Swagger JSON from backend
- Generate TypeScript types for all DTOs
- Generate API client methods for all endpoints
- Create `frontend/lib/api/api.ts` with everything

### Step 4: Verify Generated Types
Check `frontend/lib/api/api.ts` for:
- New endpoint methods
- Updated DTOs
- Proper TypeScript types

### Step 5: Update Frontend Store (if needed)
If you added new endpoints, update the corresponding Zustand store to use them.

## Example: After Completing Patient Module

### 1. Backend Complete
- Patient entity created
- Patient service with CRUD
- Patient controller with endpoints
- Swagger decorators added

### 2. Generate Client
```bash
cd frontend
npm run generate:api
```

### 3. New Types Available
```typescript
// frontend/lib/api/api.ts (auto-generated)
export interface PatientResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email?: string;
  // ... other fields
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  // ... other fields
}

// API methods
export class Api {
  patients = {
    patientsControllerFindAll: (params: { page?: number; limit?: number }) => {...},
    patientsControllerCreate: (data: CreatePatientDto) => {...},
    patientsControllerUpdate: (id: string, data: UpdatePatientDto) => {...},
    patientsControllerRemove: (id: string) => {...},
  }
}
```

### 4. Use in Frontend Store
```typescript
import { api } from '@/lib/api';
import type { CreatePatientDto, PatientResponseDto } from '@/lib/api';

export const usePatientStore = create<PatientStore>()((set) => ({
  patients: [],
  
  addPatient: async (patient: CreatePatientDto) => {
    const response = await api.patients.patientsControllerCreate(patient);
    set((state) => ({ patients: [response.data, ...state.patients] }));
  },
}));
```

## Benefits

1. **Type Safety**: Frontend knows exact shape of backend DTOs
2. **Auto-completion**: IDE suggests available endpoints and parameters
3. **Compile-time Errors**: Catch API mismatches before runtime
4. **Documentation**: Generated types serve as documentation
5. **Consistency**: Frontend always matches backend contract

## Integration with Prompts

Each backend prompt (6-16) will now include:

### At the End of Each Prompt

**Section: "Generate API Client"**

```markdown
## Generate API Client

After completing this module, regenerate the frontend API client:

1. Ensure backend is running:
   ```bash
   npm run start:dev
   ```

2. Generate client:
   ```bash
   cd frontend
   npm run generate:api
   ```

3. Verify new types in `frontend/lib/api/api.ts`

4. Update corresponding frontend store to use new endpoints
```

## Troubleshooting

### Issue: Generation Fails
**Solution**: Ensure backend is running and Swagger is accessible at `/api/docs`

### Issue: Types Not Updating
**Solution**: Delete `frontend/lib/api/api.ts` and regenerate

### Issue: Import Errors
**Solution**: Check that `@/lib/api` path is configured in `tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

This approach ensures **continuous type safety** throughout development!
