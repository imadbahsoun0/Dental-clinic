# Prompt 17: Swagger Client Generation

## Objective
Generate a TypeScript API client from the backend Swagger documentation for type-safe frontend API calls.

## Context
- Backend prompts 1-16 completed
- Swagger documentation available at `/api/docs`
- Need TypeScript client for frontend

## Prerequisites
- Backend running with Swagger
- Frontend project exists

## Tasks

### 1. Install swagger-typescript-api

```bash
cd frontend
npm install --save-dev swagger-typescript-api
```

### 2. Add Generation Script

**File: `frontend/package.json`**
```json
{
  "scripts": {
    "generate:api": "swagger-typescript-api -p http://localhost:3000/api/docs-json -o ./lib/api -n api.ts --axios --unwrap-response-data"
  }
}
```

### 3. Create API Configuration

**File: `frontend/lib/api/config.ts`**
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true, // For cookies (refresh token)
});

// Request interceptor - add access token
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

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        // Save new access token
        localStorage.setItem('access_token', data.data.accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
```

### 4. Generate Client

```bash
# Make sure backend is running
npm run generate:api
```

This will create `frontend/lib/api/api.ts` with all API methods.

### 5. Create API Instance

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

### 6. Update Environment Variables

**File: `frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Usage Example

```typescript
import { api } from '@/lib/api';

// Login
const response = await api.auth.authControllerLogin({
  email: 'user@example.com',
  password: 'password123',
});

// Get patients
const patients = await api.patients.patientsControllerFindAll({
  page: 1,
  limit: 10,
});

// Create patient
const newPatient = await api.patients.patientsControllerCreate({
  firstName: 'John',
  lastName: 'Doe',
  mobileNumber: '+1 (555) 123-4567',
});
```

## Acceptance Criteria
- [ ] swagger-typescript-api installed
- [ ] Generation script added
- [ ] API client generated
- [ ] Axios instance configured
- [ ] Token interceptors working
- [ ] Auto-refresh on 401
- [ ] Type-safe API calls

## Next Steps
Proceed to **Prompt 18: Frontend API Integration**

---
**Estimated Time**: 30-45 minutes
**Difficulty**: Medium
**Dependencies**: Backend Prompts 1-16
