# Backend Development Prompt

## Project Overview
Create a backend API for a dental clinic management system that integrates with the existing Next.js 15 frontend application. The backend should handle all data persistence, authentication, file uploads, and business logic.

## Technology Stack Recommendations
- **Framework**: Node.js with Express.js or NestJS (TypeScript recommended)
- **Database**: PostgreSQL or MySQL for relational data
- **ORM**: Prisma or TypeORM
- **Authentication**: JWT-based authentication
- **File Storage**: AWS S3 or local storage for logos and signatures
- **API Documentation**: Swagger/OpenAPI

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `name` (String)
- `role` (Enum: 'dentist', 'admin', 'staff')
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Patients Table
- `id` (UUID, Primary Key)
- `first_name` (String, Required)
- `last_name` (String, Required)
- `mobile_number` (String, Required, Unique)
- `email` (String, Optional)
- `date_of_birth` (Date, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Appointment_Types Table
- `id` (UUID, Primary Key)
- `name` (String, Required)
- `price` (Decimal, Required)
- `duration` (Integer, Required) // in minutes
- `color` (String, Required) // hex color code
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Appointments Table
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key -> Patients)
- `appointment_type_id` (UUID, Foreign Key -> Appointment_Types)
- `date` (Date, Required)
- `time` (Time, Required)
- `status` (Enum: 'confirmed', 'pending', 'cancelled')
- `notes` (Text, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Treatments Table
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key -> Patients)
- `tooth_number` (Integer, Required) // 1-32
- `appointment_type_id` (UUID, Foreign Key -> Appointment_Types)
- `total_price` (Decimal, Required)
- `amount_paid` (Decimal, Required)
- `discount` (Decimal, Default: 0)
- `date` (Date, Required)
- `notes` (Text, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Medical_History_Questions Table
- `id` (UUID, Primary Key)
- `question` (Text, Required)
- `type` (Enum: 'text', 'radio', 'checkbox', 'textarea')
- `options` (JSON, Optional) // for radio/checkbox
- `required` (Boolean, Default: false)
- `order` (Integer, Required)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Medical_History_Responses Table
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key -> Patients)
- `question_id` (UUID, Foreign Key -> Medical_History_Questions)
- `answer` (JSON, Required) // string or array of strings
- `submitted_at` (Timestamp)

### Medical_History_Submissions Table
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key -> Patients)
- `date_of_birth` (Date, Required)
- `signature` (Text, Required) // base64 encoded image
- `token` (String, Unique) // for accessing the form
- `submitted_at` (Timestamp)

### Settings Table
- `id` (UUID, Primary Key)
- `key` (String, Unique) // e.g., 'doctor_logo'
- `value` (Text) // JSON or base64 string
- `updated_at` (Timestamp)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info

### Patients
- `GET /api/patients` - List all patients (with pagination and search)
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `POST /api/patients/:id/medical-history-link` - Generate medical history link

### Appointments
- `GET /api/appointments` - List all appointments (with date filtering)
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/appointments/by-date/:date` - Get appointments for specific date

### Appointment Types
- `GET /api/appointment-types` - List all appointment types
- `GET /api/appointment-types/:id` - Get appointment type by ID
- `POST /api/appointment-types` - Create new appointment type
- `PUT /api/appointment-types/:id` - Update appointment type
- `DELETE /api/appointment-types/:id` - Delete appointment type

### Treatments
- `GET /api/treatments` - List all treatments
- `GET /api/treatments/patient/:patientId` - Get treatments for specific patient
- `POST /api/treatments` - Create new treatment
- `PUT /api/treatments/:id` - Update treatment
- `DELETE /api/treatments/:id` - Delete treatment

### Medical History
- `GET /api/medical-history/questions` - List all medical history questions
- `PUT /api/medical-history/questions` - Update medical history questions
- `GET /api/medical-history/:token` - Get medical history form by token
- `POST /api/medical-history/:token` - Submit medical history form
- `GET /api/medical-history/patient/:patientId` - Get patient's medical history

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings/logo` - Upload doctor logo
- `GET /api/settings/logo` - Get doctor logo

## Request/Response Examples

### POST /api/patients
**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "mobileNumber": "+1 (555) 123-4567",
  "email": "john.doe@email.com"
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "firstName": "John",
  "lastName": "Doe",
  "mobileNumber": "+1 (555) 123-4567",
  "email": "john.doe@email.com",
  "dateOfBirth": null,
  "createdAt": "2025-12-20T10:00:00Z",
  "updatedAt": "2025-12-20T10:00:00Z"
}
```

### POST /api/appointments
**Request:**
```json
{
  "patientId": "patient-uuid",
  "appointmentTypeId": "apt-type-uuid",
  "date": "2025-12-25",
  "time": "14:30",
  "notes": "Patient requested afternoon slot"
}
```

**Response:**
```json
{
  "id": "appointment-uuid",
  "patientId": "patient-uuid",
  "appointmentTypeId": "apt-type-uuid",
  "date": "2025-12-25",
  "time": "14:30",
  "status": "pending",
  "notes": "Patient requested afternoon slot",
  "createdAt": "2025-12-20T10:00:00Z",
  "updatedAt": "2025-12-20T10:00:00Z"
}
```

### POST /api/treatments
**Request:**
```json
{
  "patientId": "patient-uuid",
  "toothNumber": 14,
  "appointmentTypeId": "apt-type-uuid",
  "totalPrice": 800,
  "amountPaid": 400,
  "discount": 50,
  "date": "2025-12-20"
}
```

**Response:**
```json
{
  "id": "treatment-uuid",
  "patientId": "patient-uuid",
  "toothNumber": 14,
  "appointmentTypeId": "apt-type-uuid",
  "totalPrice": 800,
  "amountPaid": 400,
  "discount": 50,
  "date": "2025-12-20",
  "notes": null,
  "createdAt": "2025-12-20T10:00:00Z",
  "updatedAt": "2025-12-20T10:00:00Z"
}
```

## Authentication Requirements
- Use JWT tokens for authentication
- Tokens should expire after 24 hours
- Refresh token mechanism for extended sessions
- Protected routes should require valid JWT token
- Role-based access control (dentist, admin, staff)

## File Upload Requirements
- **Doctor Logo**: Accept image files (PNG, JPG, JPEG), max 5MB
- **Signature**: Accept base64 encoded images from canvas
- Store files in AWS S3 or local storage with proper access controls
- Return public URLs for accessing uploaded files

## Validation Requirements
- Validate all input data before processing
- Return appropriate error messages for validation failures
- Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Sanitize user inputs to prevent SQL injection and XSS attacks

## Error Handling
- Return consistent error response format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "mobileNumber",
        "message": "Mobile number is required"
      }
    ]
  }
}
```

## Additional Features to Implement
1. **Email Notifications**: Send appointment reminders via email
2. **SMS Integration**: Send medical history links via SMS
3. **Search Functionality**: Implement full-text search for patients
4. **Pagination**: Implement cursor-based pagination for large datasets
5. **Audit Logging**: Log all data modifications for compliance
6. **Backup System**: Automated database backups
7. **Rate Limiting**: Prevent API abuse
8. **CORS Configuration**: Allow frontend domain access

## Testing Requirements
- Unit tests for all business logic
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Minimum 80% code coverage

## Deployment Recommendations
- Use Docker for containerization
- Deploy to AWS, Google Cloud, or Azure
- Set up CI/CD pipeline (GitHub Actions, GitLab CI)
- Use environment variables for configuration
- Implement health check endpoints
- Set up monitoring and logging (e.g., Sentry, LogRocket)

## Security Considerations
- Hash passwords using bcrypt
- Implement rate limiting on authentication endpoints
- Use HTTPS for all communications
- Validate and sanitize all user inputs
- Implement CSRF protection
- Regular security audits and dependency updates

## Frontend Integration Points
The frontend is already configured to use Zustand stores with dummy data. Replace the dummy data with actual API calls in the following files:
- `/frontend/store/patientStore.ts`
- `/frontend/store/appointmentStore.ts`
- `/frontend/store/settingsStore.ts`
- `/frontend/store/treatmentStore.ts`

Create a new `/frontend/services/api.ts` file with axios or fetch configuration to handle all API requests.

## Next Steps
1. Set up the backend project with chosen framework
2. Configure database connection
3. Implement database schema using ORM
4. Create API endpoints following the specifications above
5. Implement authentication and authorization
6. Add file upload functionality
7. Write tests for all endpoints
8. Deploy to staging environment
9. Update frontend to use real API endpoints
10. Perform end-to-end testing
11. Deploy to production

## Support and Maintenance
- Document all API endpoints using Swagger
- Create developer documentation
- Set up error monitoring
- Plan for regular updates and security patches
