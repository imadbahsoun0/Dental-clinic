// Core Entity Types

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  color: string; // hex color code
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  appointmentTypeId: string;
  appointmentType?: AppointmentType;
  date: string; // ISO date string
  time: string; // HH:mm format
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  toothNumber: number; // 1-32
  appointmentTypeId: string;
  appointmentType?: AppointmentType;
  totalPrice: number;
  amountPaid: number;
  discount: number;
  date: string; // ISO date string
  notes?: string;
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
  appointmentTypes: AppointmentType[];
  medicalHistoryQuestions: MedicalHistoryQuestion[];
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'dentist' | 'admin' | 'staff';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
