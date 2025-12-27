# Prompt 19: Form Validation with React Hook Form

## Objective
Implement client-side form validation using React Hook Form with a shared FormControl component for consistent validation across all forms.

## Context
- Prompt 18 completed: API integration working
- Need consistent form validation
- All modals and forms should use React Hook Form

## Prerequisites
- Prompt 18 completed
- Forms currently exist but without validation

## Tasks

### 1. Install React Hook Form

```bash
cd frontend
npm install react-hook-form @hookform/resolvers zod
```

### 2. Create Shared FormControl Component

**File: `frontend/components/common/FormControl.tsx`**
```typescript
import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface FormControlProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: FieldError;
  register: UseFormRegister<any>;
  validation?: object;
  className?: string;
  disabled?: boolean;
}

export function FormControl({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  error,
  register,
  validation = {},
  className = '',
  disabled = false,
}: FormControlProps) {
  return (
    <div className={`form-control ${className}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-input ${error ? 'border-red-500' : ''}`}
        {...register(name, {
          required: required ? `${label} is required` : false,
          ...validation,
        })}
      />
      
      {error && (
        <span className="text-red-500 text-sm mt-1">{error.message}</span>
      )}
    </div>
  );
}
```

**File: `frontend/components/common/FormSelect.tsx`**
```typescript
import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface FormSelectProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: FieldError;
  register: UseFormRegister<any>;
  validation?: object;
  className?: string;
  disabled?: boolean;
}

export function FormSelect({
  name,
  label,
  options,
  required = false,
  error,
  register,
  validation = {},
  className = '',
  disabled = false,
}: FormSelectProps) {
  return (
    <div className={`form-control ${className}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        id={name}
        disabled={disabled}
        className={`form-select ${error ? 'border-red-500' : ''}`}
        {...register(name, {
          required: required ? `${label} is required` : false,
          ...validation,
        })}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <span className="text-red-500 text-sm mt-1">{error.message}</span>
      )}
    </div>
  );
}
```

### 3. Update Patient Modal with Validation

**File: `frontend/components/modals/PatientModal.tsx`** (example)
```typescript
import { useForm } from 'react-hook-form';
import { FormControl } from '@/components/common/FormControl';
import { usePatientStore } from '@/store/patientStore';
import toast from 'react-hot-toast';

interface PatientFormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
}

export function PatientModal({ patient, onClose }: { patient?: Patient; onClose: () => void }) {
  const { addPatient, updatePatient } = usePatientStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    defaultValues: patient || {},
  });

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (patient) {
        await updatePatient(patient.id, data);
      } else {
        await addPatient(data);
      }
      onClose();
    } catch (error) {
      // Error already handled in store with toast
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{patient ? 'Edit Patient' : 'Add Patient'}</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl
            name="firstName"
            label="First Name"
            required
            register={register}
            error={errors.firstName}
            validation={{
              minLength: { value: 2, message: 'Minimum 2 characters' },
            }}
          />

          <FormControl
            name="lastName"
            label="Last Name"
            required
            register={register}
            error={errors.lastName}
          />

          <FormControl
            name="mobileNumber"
            label="Mobile Number"
            required
            register={register}
            error={errors.mobileNumber}
            validation={{
              pattern: {
                value: /^\+?[1-9]\d{1,14}$/,
                message: 'Invalid phone number',
              },
            }}
          />

          <FormControl
            name="email"
            label="Email"
            type="email"
            register={register}
            error={errors.email}
            validation={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
          />

          <FormControl
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            register={register}
            error={errors.dateOfBirth}
          />

          <FormControl
            name="address"
            label="Address"
            register={register}
            error={errors.address}
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 4. Update Other Modals

Apply the same pattern to:
- `AppointmentModal.tsx`
- `TreatmentModal.tsx`
- `PaymentModal.tsx`
- `ExpenseModal.tsx`
- Any other forms

### 5. Add Form Styles

**File: `frontend/styles/forms.css`**
```css
.form-control {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.border-red-500,
.form-select.border-red-500 {
  border-color: #ef4444;
}

.form-input:disabled,
.form-select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
```

## Acceptance Criteria
- [ ] React Hook Form installed
- [ ] FormControl component created
- [ ] FormSelect component created
- [ ] Patient modal using validation
- [ ] All modals updated
- [ ] Error messages showing
- [ ] Required fields marked
- [ ] Pattern validation working
- [ ] Submit disabled while loading

## Next Steps
Proceed to **Prompt 20: Role-Based UI Components**

---
**Estimated Time**: 60-90 minutes
**Difficulty**: Medium
**Dependencies**: Prompt 18
