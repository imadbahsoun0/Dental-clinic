// Core Entity Types

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  medicalHistory?: MedicalHistorySubmission;
  enablePaymentReminders?: boolean; // Enable/disable payment reminder notifications (default: true)
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
  discount: number;
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

export interface Expense {
  id: string;
  name: string; // Selected from dropdown or custom "Other" value
  amount: number;
  date: string; // ISO date string
  invoiceFile?: string; // Optional file path/URL
  notes?: string;
  doctorId?: string; // Link to doctor user for doctor payment expenses
  expenseType?: string; // Type of expense (e.g., "Doctor Payment", "Supplies", etc.)
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistoryQuestion {
  id: string;
  question: string;
  type: 'text' | 'radio' | 'checkbox' | 'textarea';
  options?: string[]; // for radio/checkbox
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
  responses: {
    questionId: string;
    answer: string | string[];
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
  userId: string;
  orgId: string;
  role: 'dentist' | 'secretary' | 'admin';
  status: 'active' | 'inactive';
  wallet?: number; // Current wallet balance for dentists in this org (default 0)
  percentage?: number; // Commission percentage for dentists in this org (e.g., 30 for 30%)
  createdAt: string;
  updatedAt: string;
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

export interface ClinicBranding {
  logo?: string; // base64 or URL
  clinicName: string;
  location: string;
  phone: string;
  email: string;
  website?: string;
}

export interface NotificationTemplate {
  enabled: boolean;
  timing: number; // in hours for appointment reminder, days for payment reminder
  timingUnit: 'hours' | 'days';
  messageTemplate: string; // Template with {{variables}}
}

export interface NotificationSettings {
  appointmentReminder: NotificationTemplate;
  paymentReminder: NotificationTemplate;
}

// UI Component Props Types

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
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
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export interface CardProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
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
