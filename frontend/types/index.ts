// Core Entity Types

import type { CSSProperties, ReactNode } from 'react';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  bloodType?: string;
  medicalHistory?: MedicalHistorySubmission;
  followUpDate?: string;
  followUpReason?: string;
  followUpStatus?: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentCategory {
  id: string;
  name: string;
  icon: string; // emoji icon
  order: number; // for sorting
}

export interface PriceVariant {
  id?: string; // Optional as backend JSON objects might not have IDs
  name?: string; // Backend uses name
  toothSpec?: string; // Legacy frontend field
  toothNumbers?: number[]; // Parsed tooth numbers for matching (empty for default)
  price: number;
  label?: string; // Optional display label
  isDefault?: boolean; // If true, this is the default price when no tooth-specific match
}

export interface TreatmentType {
  id: string;
  name: string;
  categoryId?: string;
  priceVariants: PriceVariant[];
  duration: number;
  color: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: { id: string; firstName: string; lastName: string };
  treatmentTypeId?: string;
  treatmentType?: TreatmentType;

  date: string; // ISO date string
  time: string; // HH:mm format
  status: 'confirmed' | 'pending' | 'cancelled';

  doctorId?: string;
  doctor?: { id: string; name: string };
  drName?: string; // Legacy

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  toothNumber: number; // Legacy: single tooth (kept for backward compatibility)
  toothNumbers?: number[]; // New: support multiple teeth
  toothName?: string; // Optional: descriptive tooth name
  treatmentTypeId: string;
  treatmentType?: TreatmentType;
  appointmentId?: string; // Link to appointment (for non-planned treatments)
  appointment?: Appointment; // Populated appointment object
  totalPrice: number; // Total price for all teeth
  amountPaid: number;
  discount: number; // Discount amount in dollars
  date: string; // ISO date string (from appointment or manual for planned)
  drName?: string; // Doctor name (from appointment or manual for planned)
  status?: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  patientId: string;
  amount: number;
  date: string; // ISO date string
  paymentMethod: 'cash' | 'card' | 'transfer' | 'check' | 'other';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseType = 
  | 'lab'
  | 'equipment'
  | 'utilities'
  | 'rent'
  | 'salary'
  | 'doctor_payment'
  | 'other';

export interface Expense {
  id: string;
  name: string; // Selected from dropdown or custom "Other" value
  amount: number;
  date: string; // ISO date string
  invoiceFile?: string; // Optional file path/URL
  notes?: string;
  doctorId?: string; // Link to doctor user for doctor payment expenses
  expenseType?: ExpenseType; // Type of expense
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistoryQuestion {
  id: string;
  question: string;
  type: 'text' | 'radio' | 'checkbox' | 'textarea' | 'radio_with_text';
  options?: string[]; // for radio/checkbox/radio_with_text
  textTriggerOption?: string; // for radio_with_text: which option triggers text input
  textFieldLabel?: string; // for radio_with_text: label for the text field
  required: boolean;
  order: number;
}

export interface MedicalHistoryResponse {
  id: string;
  patientId: string;
  questionId: string;
  answer: string | string[]; // string for text/radio, array for checkbox
  submittedAt: string;
}

export interface MedicalHistorySubmission {
  patientId: string;
  dateOfBirth: string;
  emergencyContact: string;
  email?: string;
  bloodType: string;
  address: string;
  responses: {
    questionId: string;
    questionText?: string; // Stored question text
    questionType?: string; // Stored question type
    answer: string | string[];
    answerText?: string;
  }[];
  signature: string; // base64 encoded signature image
  submittedAt: string;
}

export interface Settings {
  doctorLogo?: string; // base64 or URL
  treatmentTypes: TreatmentType[];
  medicalHistoryQuestions: MedicalHistoryQuestion[];
  doctors?: string[]; // List of doctor names
}

// User can belong to multiple organizations with different roles
export interface UserOrganization {
  id: string;
  userId?: string;
  orgId: string;
  role: 'dentist' | 'secretary' | 'admin';
  status: 'active' | 'inactive';
  wallet?: number; // Current wallet balance for dentists in this org (default 0)
  percentage?: number; // Commission percentage for dentists in this org (e.g., 30 for 30%)
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string; // Password for authentication
  createdAt: string;
  updatedAt: string;
  // User's organizations and roles
  organizations?: UserOrganization[];
  // Current active organization (set after login/org selection)
  currentOrg?: UserOrganization;
}

// Extended User type with flattened role for UI convenience
export interface UserWithRole extends User {
  role?: 'dentist' | 'secretary' | 'admin';
  status?: 'active' | 'inactive';
  wallet?: number;
  percentage?: number;
}

export interface ClinicBranding {
  logo?: string; // base64 or URL
  logoId?: string; // Attachment ID (for updates)
  clinicName: string;
  location: string;
  phone: string;
  email: string;
  website?: string;
  defaultDoctorId?: string | null;
}

export interface NotificationTemplate {
  enabled: boolean;
  timing: number; // in hours for appointment reminder, days for payment reminder
  timingUnit: 'hours' | 'days';
  messageTemplate: string; // Template with {{variables}}
}

export interface AppointmentReminder {
  enabled: boolean;
  timingInHours: number;
}

export interface MessageTemplates {
  medical_history: string;
  payment_receipt: string;
  appointment_reminder: string;
  follow_up: string;
  payment_overdue: string;
}

export interface NotificationSettings {
  appointmentReminders: AppointmentReminder[];
  messageTemplates: MessageTemplates;
  notificationToggles?: {
    medical_history: boolean;
    payment_receipt: boolean;
    follow_up: boolean;
    payment_overdue: boolean;
  };
}

export interface Message {
  id: string;
  patientId: string;
  type: 'medical_history' | 'payment_receipt' | 'appointment_reminder' | 'follow_up' | 'payment_overdue';
  content: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  error?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpStatus {
  PENDING: 'pending';
  COMPLETED: 'completed';
  CANCELLED: 'cancelled';
}

// UI Component Props Types

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: CSSProperties;
  title?: string;
}

export interface InputProps {
  type?: 'text' | 'email' | 'tel' | 'date' | 'time' | 'number' | 'password';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
  step?: string;
  min?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export interface CardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

// Statistics Types

export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  pendingPayments: number;
}

// Calendar Types

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

// Auth Types

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
