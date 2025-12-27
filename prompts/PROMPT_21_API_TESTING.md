# Prompt 21: API Testing & Validation

## Objective
Comprehensively test all API endpoints with different roles, verify multi-org isolation, and create a Postman collection for documentation.

## Context
- All prompts 1-20 completed
- Backend and frontend fully integrated
- Need to verify everything works correctly

## Prerequisites
- All previous prompts completed
- Backend and frontend running

## Testing Checklist

### 1. Authentication Endpoints

**Test Login (Single Org User)**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.smith@dentalclinic.com",
    "password": "password123"
  }'

# Expected: accessToken returned, no org selection needed
```

**Test Login (Multi-Org User)**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex.martinez@dentalclinic.com",
    "password": "password123"
  }'

# Expected: needsOrgSelection: true, no accessToken
```

**Test Organization Selection**
```bash
curl -X POST http://localhost:3000/api/v1/auth/select-organization \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-5",
    "orgId": "org-1"
  }'

# Expected: accessToken returned
```

**Test Token Refresh**
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  --cookie "refresh_token=YOUR_REFRESH_TOKEN"

# Expected: New accessToken
```

**Test Logout**
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: Success, refresh token cleared
```

### 2. Role-Based Access Control

**Admin Access (Should Succeed)**
```bash
# Login as admin
ADMIN_TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"james.wilson@dentalclinic.com","password":"password123"}' \
  | jq -r '.data.accessToken')

# Test admin-only endpoint
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected: Success, list of users
```

**Dentist Access (Should Fail for Admin Endpoints)**
```bash
# Login as dentist
DENTIST_TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.smith@dentalclinic.com","password":"password123"}' \
  | jq -r '.data.accessToken')

# Test admin-only endpoint
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $DENTIST_TOKEN"

# Expected: 403 Forbidden
```

**Secretary Access (Should Fail for Revenue)**
```bash
# Login as secretary
SECRETARY_TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"emily.davis@dentalclinic.com","password":"password123"}' \
  | jq -r '.data.accessToken')

# Test revenue endpoint
curl -X GET http://localhost:3000/api/v1/analytics/revenue \
  -H "Authorization: Bearer $SECRETARY_TOKEN"

# Expected: 403 Forbidden
```

### 3. Multi-Org Data Isolation

**Create Patient in Org 1**
```bash
curl -X POST http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer ORG1_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Patient",
    "mobileNumber": "+1234567890"
  }'

# Note the patient ID
```

**Try to Access from Org 2 (Should Fail)**
```bash
curl -X GET http://localhost:3000/api/v1/patients/PATIENT_ID \
  -H "Authorization: Bearer ORG2_ADMIN_TOKEN"

# Expected: 404 Not Found (patient not in org 2)
```

### 4. CRUD Operations Testing

Test all CRUD operations for each module:

**Patients**
- [ ] Create patient
- [ ] List patients with pagination
- [ ] Search patients
- [ ] Get patient by ID
- [ ] Update patient
- [ ] Delete patient

**Appointments**
- [ ] Create appointment
- [ ] List appointments (role-based)
- [ ] Get appointments by date
- [ ] Update appointment
- [ ] Delete appointment
- [ ] Dentist sees only own appointments

**Treatments**
- [ ] Create treatment
- [ ] List treatments (role-based)
- [ ] Update treatment status
- [ ] Verify wallet update on completion
- [ ] Dentist sees only own treatments

**Payments**
- [ ] Create payment
- [ ] List payments
- [ ] Get patient payment history

**Expenses**
- [ ] Create expense
- [ ] List expenses
- [ ] Create doctor payment expense
- [ ] Get total expenses

**Settings** (Admin only)
- [ ] Create appointment type
- [ ] Update treatment category
- [ ] Manage medical history questions
- [ ] Update notification settings

**Wallet & Revenue**
- [ ] Get doctor wallet
- [ ] Pay doctor (deducts wallet, creates expense)
- [ ] Get doctor revenue
- [ ] Get org revenue (admin only)

### 5. Create Postman Collection

1. **Install Postman** or use Postman web

2. **Import Swagger**:
   - Open Postman
   - Import → Link
   - Enter: `http://localhost:3000/api/docs-json`

3. **Create Environment**:
   ```json
   {
     "name": "Dental Clinic - Local",
     "values": [
       { "key": "baseUrl", "value": "http://localhost:3000/api/v1" },
       { "key": "adminToken", "value": "" },
       { "key": "dentistToken", "value": "" },
       { "key": "secretaryToken", "value": "" }
     ]
   }
   ```

4. **Create Test Collection**:
   - Folder: Authentication
     - Login (Admin)
     - Login (Dentist)
     - Login (Secretary)
     - Refresh Token
     - Logout
   
   - Folder: Patients (CRUD)
   - Folder: Appointments (CRUD)
   - Folder: Treatments (CRUD)
   - Folder: Payments (CRUD)
   - Folder: Expenses (CRUD)
   - Folder: Settings (Admin)
   - Folder: Revenue (Role-based)

5. **Export Collection**:
   - Export as `Dental-Clinic-API.postman_collection.json`
   - Save in project root

## Acceptance Criteria

- [ ] All auth endpoints tested
- [ ] Role-based access verified
- [ ] Multi-org isolation verified
- [ ] All CRUD operations tested
- [ ] Wallet update on treatment completion verified
- [ ] Postman collection created
- [ ] All tests documented
- [ ] No security vulnerabilities found

## Common Issues to Check

1. **Token Expiration**: Verify refresh works
2. **CORS**: Check frontend can call backend
3. **Cookies**: Verify refresh token in HTTP-only cookie
4. **Org Isolation**: Users can't access other org data
5. **Role Enforcement**: Dentists can't access admin endpoints
6. **Wallet Calculation**: Commission calculated correctly

## Next Steps

Proceed to **Prompt 22: Production Readiness**

---
**Estimated Time**: 60-90 minutes
**Difficulty**: Medium
**Dependencies**: Prompts 1-20
