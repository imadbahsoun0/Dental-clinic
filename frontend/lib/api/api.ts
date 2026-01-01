/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface StandardResponse {
  /** @example true */
  success: boolean;
  /** @example "Operation completed successfully" */
  message: string;
  data: object;
  /** @example "2025-12-27T10:00:00Z" */
  timestamp: string;
}

export interface UserOrgDto {
  id: string;
  userId: string;
  orgId: string;
  orgName?: string;
  role: "admin" | "dentist" | "secretary";
  status: "active" | "inactive";
  wallet?: number;
  percentage?: number;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organizations?: UserOrgDto[];
  currentOrg?: UserOrgDto;
}

export interface LoginResponseDto {
  user: UserDto;
  needsOrgSelection: boolean;
  accessToken?: string;
}

export interface ErrorResponse {
  /** @example false */
  success: boolean;
  /** @example "Error message" */
  message: string;
  /** @example "BAD_REQUEST" */
  error: string;
  /** @example ["field1 is required","field2 must be a string"] */
  details: string[];
  /** @example "2025-12-27T10:00:00Z" */
  timestamp: string;
  /** @example "/api/v1/patients" */
  path: string;
}

export interface LoginDto {
  /** @example "sarah.smith@dentalclinic.com" */
  email: string;
  /** @example "password123" */
  password: string;
}

export interface SelectOrgResponseDto {
  accessToken: string;
  currentOrg: UserOrgDto;
}

export interface SelectOrganizationDto {
  /** @example "org-uuid-here" */
  orgId: string;
}

export interface RefreshResponseDto {
  accessToken: string;
}

export type Object = object;

export interface ForgotPasswordDto {
  /** @example "user@example.com" */
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  /** @example "newPassword123" */
  newPassword: string;
}

export interface ChangePasswordDto {
  /** @example "oldPassword123" */
  currentPassword: string;
  /**
   * @minLength 8
   * @example "newPassword123"
   */
  newPassword: string;
}

export interface UserOrgResponseDto {
  id: string;
  orgId: string;
  role: string;
  status: string;
  wallet?: number;
  percentage?: number;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organizations: UserOrgResponseDto[];
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface CreateUserDto {
  /** @example "Dr. John Doe" */
  name: string;
  /** @example "john.doe@dentalclinic.com" */
  email: string;
  /**
   * @minLength 6
   * @example "password123"
   */
  password?: string;
  /** @example "+1 (555) 123-4567" */
  phone?: string;
  /** @example "dentist" */
  role: "admin" | "dentist" | "secretary";
  /**
   * Commission percentage for dentists
   * @example 30
   */
  percentage?: number;
}

export interface UpdateProfileDto {
  /** @example "Dr. John Doe" */
  name?: string;
  /** @example "+1234567890" */
  phone?: string;
  /** @example "john.doe@example.com" */
  email?: string;
}

export interface UpdateUserDto {
  /** @example "Dr. John Doe" */
  name?: string;
  /** @example "+1 (555) 123-4567" */
  phone?: string;
  role?: "admin" | "dentist" | "secretary";
  status?: "active" | "inactive";
  /** @example 30 */
  percentage?: number;
}

export interface OrganizationResponseDto {
  id: string;
  name: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: object;
  isActive: boolean;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface CreateOrganizationDto {
  /** @example "DentaCare Pro Clinic" */
  name: string;
  /** @example "123 Dental Street, Suite 100, New York, NY 10001" */
  location?: string;
  /** @example "+1 (555) 123-4567" */
  phone?: string;
  /** @example "info@dentacarepro.com" */
  email?: string;
  /** @example "https://www.dentacarepro.com" */
  website?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  /** Attachment ID for the logo */
  logoId?: string;
  isActive?: boolean;
}

export interface PatientResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email?: string;
  /** @format date-time */
  dateOfBirth?: string;
  address?: string;
  medicalHistory?: object;
  enablePaymentReminders: boolean;
  documents?: object[];
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface CreatePatientDto {
  /** @example "John" */
  firstName: string;
  /** @example "Doe" */
  lastName: string;
  /** @example "+1 (555) 123-4567" */
  mobileNumber: string;
  /** @example "john.doe@email.com" */
  email?: string;
  /** @example "1990-05-15" */
  dateOfBirth?: string;
  address?: string;
  medicalHistory?: object;
  /** @example true */
  enablePaymentReminders?: boolean;
  documentIds?: string[];
}

export interface UpdatePatientDto {
  /** @example "John" */
  firstName?: string;
  /** @example "Doe" */
  lastName?: string;
  /** @example "+1 (555) 123-4567" */
  mobileNumber?: string;
  /** @example "john.doe@email.com" */
  email?: string;
  /** @example "1990-05-15" */
  dateOfBirth?: string;
  address?: string;
  medicalHistory?: object;
  /** @example true */
  enablePaymentReminders?: boolean;
  documentIds?: string[];
}

export interface MedicalHistoryAnswerResponseDto {
  /** @example "550e8400-e29b-41d4-a716-446655440000" */
  questionId: string;
  /** @example "Do you have any allergies?" */
  questionText: string;
  /** @example "TEXT" */
  questionType: "TEXT" | "YES_NO" | "CHECKBOX" | "RADIO" | "RADIO_WITH_TEXT";
  answer: string | string[];
  /** @example "Penicillin allergy" */
  answerText?: string;
}

export interface MedicalHistorySubmissionResponseDto {
  /** @example "1990-01-15" */
  dateOfBirth: string;
  /** @example "+1234567890" */
  emergencyContact: string;
  /** @example "patient@example.com" */
  email?: string;
  /** @example "A+" */
  bloodType: string;
  /** @example "123 Main St, City, Country" */
  address: string;
  responses: MedicalHistoryAnswerResponseDto[];
  /** @example "data:image/png;base64,..." */
  signature: string;
  /** @format date-time */
  submittedAt: string;
}

export interface MedicalHistoryAnswerDto {
  /** @example "550e8400-e29b-41d4-a716-446655440000" */
  questionId: string;
  /**
   * Answer can be string or array of strings for checkbox questions
   * @example "Yes"
   */
  answer: string | string[];
  /**
   * Additional text input for radio_with_text questions
   * @example "Penicillin allergy"
   */
  answerText?: string;
}

export interface SubmitMedicalHistoryDto {
  /** @example "1990-01-15" */
  dateOfBirth: string;
  /** @example "+1234567890" */
  emergencyContact: string;
  /** @example "patient@example.com" */
  email?: string;
  /** @example "A+" */
  bloodType: string;
  /** @example "123 Main St, City, Country" */
  address: string;
  /** Array of question answers */
  responses: MedicalHistoryAnswerDto[];
  /**
   * Base64 encoded signature image
   * @example "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
   */
  signature: string;
}

export interface CreateAppointmentDto {
  /** @example "patient-uuid-here" */
  patientId: string;
  /** @example "treatment-type-uuid-here" */
  treatmentTypeId?: string;
  /**
   * If provided, the treatment status will be updated to IN_PROGRESS
   * @example "treatment-uuid-here"
   */
  treatmentId?: string;
  /** @example "2024-01-15" */
  date: string;
  /** @example "14:30" */
  time: string;
  /**
   * Doctor ID is required
   * @example "doctor-uuid-here"
   */
  doctorId: string;
  /** @example "Patient requested morning slot" */
  notes?: string;
}

export interface UpdateAppointmentDto {
  /** @example "patient-uuid-here" */
  patientId?: string;
  /** @example "treatment-type-uuid-here" */
  treatmentTypeId?: string;
  /**
   * If provided, the treatment status will be updated to IN_PROGRESS
   * @example "treatment-uuid-here"
   */
  treatmentId?: string;
  /** @example "2024-01-15" */
  date?: string;
  /** @example "14:30" */
  time?: string;
  /**
   * Doctor ID is required
   * @example "doctor-uuid-here"
   */
  doctorId?: string;
  /** @example "Patient requested morning slot" */
  notes?: string;
  /** Appointment status (only for updates) */
  status?: "confirmed" | "pending" | "cancelled";
}

export interface TreatmentResponseDto {
  id: string;
  patientId: string;
  patient?: object;
  treatmentTypeId: string;
  treatmentType?: object;
  toothNumbers: number[];
  totalPrice: number;
  discount: number;
  status: "planned" | "in-progress" | "completed" | "cancelled";
  appointmentId?: string;
  appointment?: object;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTreatmentDto {
  /** Patient ID */
  patientId: string;
  /** Treatment type ID */
  treatmentTypeId: string;
  /** Array of tooth numbers */
  toothNumbers: number[];
  /**
   * Total price
   * @example 100
   */
  totalPrice: number;
  /**
   * Discount amount
   * @default 0
   * @example 0
   */
  discount: number;
  /**
   * Treatment status
   * @default "planned"
   */
  status: "planned" | "in-progress" | "completed" | "cancelled";
  /** Appointment ID (required for non-planned treatments) */
  appointmentId?: string;
  /** Additional notes */
  notes?: string;
}

export interface UpdateTreatmentDto {
  /** Patient ID */
  patientId?: string;
  /** Treatment type ID */
  treatmentTypeId?: string;
  /** Array of tooth numbers */
  toothNumbers?: number[];
  /**
   * Total price
   * @example 100
   */
  totalPrice?: number;
  /**
   * Discount amount
   * @default 0
   * @example 0
   */
  discount?: number;
  /**
   * Treatment status
   * @default "planned"
   */
  status?: "planned" | "in-progress" | "completed" | "cancelled";
  /** Appointment ID (required for non-planned treatments) */
  appointmentId?: string;
  /** Additional notes */
  notes?: string;
}

export interface TreatmentCategoryResponseDto {
  id: string;
  name: string;
  icon?: string;
  order?: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface CreateTreatmentCategoryDto {
  name: string;
  icon?: string;
  order?: number;
}

export interface UpdateTreatmentCategoryDto {
  name?: string;
  icon?: string;
  order?: number;
}

export interface PriceVariantDto {
  name: string;
  price: number;
  currency?: string;
  toothNumbers?: string[];
  isDefault?: boolean;
}

export interface TreatmentTypeResponseDto {
  id: string;
  name: string;
  categoryId: string;
  priceVariants: PriceVariantDto[];
  duration: number;
  color: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface CreateTreatmentTypeDto {
  name: string;
  categoryId: string;
  priceVariants: PriceVariantDto[];
  duration: number;
  color: string;
}

export interface UpdateTreatmentTypeDto {
  name?: string;
  categoryId?: string;
  priceVariants?: PriceVariantDto[];
  duration?: number;
  color?: string;
}

export interface PaymentResponseDto {
  id: string;
  patientId: string;
  patient?: object;
  amount: number;
  date: string;
  paymentMethod: "cash" | "card" | "transfer" | "check" | "other";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  /** Patient ID */
  patientId: string;
  /**
   * Payment amount
   * @example 100
   */
  amount: number;
  /**
   * Payment date (ISO format)
   * @example "2024-01-15"
   */
  date: string;
  /** Payment method */
  paymentMethod: "cash" | "card" | "transfer" | "check" | "other";
  /** Additional notes */
  notes?: string;
}

export interface UpdatePaymentDto {
  /** Patient ID */
  patientId?: string;
  /**
   * Payment amount
   * @example 100
   */
  amount?: number;
  /**
   * Payment date (ISO format)
   * @example "2024-01-15"
   */
  date?: string;
  /** Payment method */
  paymentMethod?: "cash" | "card" | "transfer" | "check" | "other";
  /** Additional notes */
  notes?: string;
}

export interface MedicalHistoryQuestionResponseDto {
  id: string;
  question: string;
  type: "text" | "radio" | "checkbox" | "textarea" | "radio_with_text";
  options?: string[];
  textTriggerOption?: string;
  textFieldLabel?: string;
  required: boolean;
  order: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface CreateMedicalHistoryQuestionDto {
  /** @example "Do you have any allergies?" */
  question: string;
  /** @example "text" */
  type: "text" | "radio" | "checkbox" | "textarea" | "radio_with_text";
  /** @example ["Yes","No"] */
  options?: string[];
  /**
   * For radio_with_text: which option triggers text input
   * @example "Other"
   */
  textTriggerOption?: string;
  /**
   * Label for the conditional text field
   * @example "Please specify"
   */
  textFieldLabel?: string;
  /** @example true */
  required: boolean;
  /** @example 1 */
  order: number;
}

export interface UpdateMedicalHistoryQuestionDto {
  /** @example "Do you have any allergies?" */
  question?: string;
  /** @example "text" */
  type?: "text" | "radio" | "checkbox" | "textarea" | "radio_with_text";
  /** @example ["Yes","No"] */
  options?: string[];
  /**
   * For radio_with_text: which option triggers text input
   * @example "Other"
   */
  textTriggerOption?: string;
  /**
   * Label for the conditional text field
   * @example "Please specify"
   */
  textFieldLabel?: string;
  /** @example true */
  required?: boolean;
  /** @example 1 */
  order?: number;
}

export interface AppointmentReminderResponseDto {
  enabled: boolean;
  timing: number;
  timingUnit: string;
  messageTemplate: string;
}

export interface PaymentReminderResponseDto {
  enabled: boolean;
  timing: number;
  timingUnit: string;
  messageTemplate: string;
}

export interface NotificationSettingsResponseDto {
  id: string;
  appointmentReminder: AppointmentReminderResponseDto;
  paymentReminder: PaymentReminderResponseDto;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface AppointmentReminderDto {
  enabled: boolean;
  timing: number;
  timingUnit: "hours" | "days";
  messageTemplate: string;
}

export interface PaymentReminderDto {
  enabled: boolean;
  timing: number;
  timingUnit: "hours" | "days";
  messageTemplate: string;
}

export interface UpdateNotificationSettingsDto {
  appointmentReminder: AppointmentReminderDto;
  paymentReminder: PaymentReminderDto;
}

export interface CreateExpenseDto {
  /**
   * Expense name
   * @example "Lab Equipment"
   */
  name: string;
  /**
   * Expense amount
   * @example 500
   */
  amount: number;
  /**
   * Expense date
   * @example "2024-01-15"
   */
  date: string;
  /**
   * Invoice attachment ID (optional)
   * @example "uuid"
   */
  invoiceId?: string;
  /**
   * Additional notes
   * @example "Payment for lab work"
   */
  notes?: string;
  /**
   * Doctor ID for doctor-related expenses
   * @example "uuid"
   */
  doctorId?: string;
  /**
   * Type of expense
   * @example "lab"
   */
  expenseType:
    | "lab"
    | "equipment"
    | "utilities"
    | "rent"
    | "salary"
    | "doctor_payment"
    | "other";
}

export interface ProcessDoctorPaymentDto {
  /**
   * ID of the doctor to pay
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  doctorId: string;
  /**
   * Payment amount
   * @example 1000
   */
  amount: number;
  /**
   * Payment notes
   * @example "Commission payment for December 2025"
   */
  notes: string;
}

export interface UpdateExpenseDto {
  /**
   * Expense name
   * @example "Lab Equipment"
   */
  name?: string;
  /**
   * Expense amount
   * @example 500
   */
  amount?: number;
  /**
   * Expense date
   * @example "2024-01-15"
   */
  date?: string;
  /**
   * Invoice attachment ID
   * @example "uuid"
   */
  invoiceId?: string;
  /**
   * Additional notes
   * @example "Payment for lab work"
   */
  notes?: string;
  /**
   * Doctor ID for doctor-related expenses
   * @example "uuid"
   */
  doctorId?: string;
  /**
   * Type of expense
   * @example "lab"
   */
  expenseType?:
    | "lab"
    | "equipment"
    | "utilities"
    | "rent"
    | "salary"
    | "doctor_payment"
    | "other";
}

export interface DashboardStatsDto {
  /** Count of today's appointments (not cancelled or deleted) */
  todayAppointments: number;
  /** Total number of active patients */
  totalPatients: number;
  /** Sum of all patient balances (treatment costs - payments) */
  pendingPayments: number;
  /** Today's total payments minus today's expenses */
  dailyNetIncome: number;
}

export interface PendingTreatmentDto {
  id: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  treatmentTypeId: string;
  treatmentTypeName: string;
  totalPrice: number;
  discount: number;
  notes?: string;
  createdAt: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance
      .request({
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type ? { "Content-Type": type } : {}),
        },
        params: query,
        responseType: responseFormat,
        data: body,
        url: path,
      })
      .then((response) => response.data);
  };
}

/**
 * @title Dental Clinic Management API
 * @version 1.0
 * @contact
 *
 * API documentation for Dental Clinic Management System
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Authentication
     * @name AuthControllerLogin
     * @summary Login with email and password
     * @request POST:/api/v1/auth/login
     */
    authControllerLogin: (data: LoginDto, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: LoginResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authentication
     * @name AuthControllerSelectOrganization
     * @summary Select organization for multi-org users
     * @request POST:/api/v1/auth/select-organization
     * @secure
     */
    authControllerSelectOrganization: (
      data: SelectOrganizationDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: SelectOrgResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/auth/select-organization`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authentication
     * @name AuthControllerRefresh
     * @summary Refresh access token
     * @request POST:/api/v1/auth/refresh
     */
    authControllerRefresh: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: RefreshResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/auth/refresh`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authentication
     * @name AuthControllerLogout
     * @summary Logout and revoke refresh token
     * @request POST:/api/v1/auth/logout
     * @secure
     */
    authControllerLogout: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/auth/logout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authentication
     * @name AuthControllerForgotPassword
     * @summary Request password reset
     * @request POST:/api/v1/auth/forgot-password
     */
    authControllerForgotPassword: (
      data: ForgotPasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/auth/forgot-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authentication
     * @name AuthControllerResetPassword
     * @summary Reset password using token
     * @request POST:/api/v1/auth/reset-password
     */
    authControllerResetPassword: (
      data: ResetPasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/auth/reset-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authentication
     * @name AuthControllerChangePassword
     * @summary Change password for authenticated user
     * @request PATCH:/api/v1/auth/change-password
     * @secure
     */
    authControllerChangePassword: (
      data: ChangePasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/auth/change-password`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerCreate
     * @summary Create a new user in the organization
     * @request POST:/api/v1/users
     * @secure
     */
    usersControllerCreate: (data: CreateUserDto, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: UserResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/users`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindAll
     * @summary Get all users in the organization
     * @request GET:/api/v1/users
     * @secure
     */
    usersControllerFindAll: (
      query?: {
        /**
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * @min 1
         * @max 1000
         * @default 10
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: UserResponseDto[];
        },
        ErrorResponse
      >({
        path: `/api/v1/users`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerGetProfile
     * @summary Get current user profile
     * @request GET:/api/v1/users/profile
     * @secure
     */
    usersControllerGetProfile: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: UserResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/users/profile`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerUpdateProfile
     * @summary Update current user profile
     * @request PATCH:/api/v1/users/profile
     * @secure
     */
    usersControllerUpdateProfile: (
      data: UpdateProfileDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: UserResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/users/profile`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerGetDentists
     * @summary Get all dentists in the organization
     * @request GET:/api/v1/users/dentists
     * @secure
     */
    usersControllerGetDentists: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object[];
        },
        ErrorResponse
      >({
        path: `/api/v1/users/dentists`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindOne
     * @summary Get a user by ID
     * @request GET:/api/v1/users/{id}
     * @secure
     */
    usersControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: UserResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/users/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerUpdate
     * @summary Update a user
     * @request PATCH:/api/v1/users/{id}
     * @secure
     */
    usersControllerUpdate: (
      id: string,
      data: UpdateUserDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: UserResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/users/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerRemove
     * @summary Deactivate a user
     * @request DELETE:/api/v1/users/{id}
     * @secure
     */
    usersControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/users/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Organizations
     * @name OrganizationsControllerCreate
     * @summary Create a new organization (manual/super admin only)
     * @request POST:/api/v1/organizations
     * @secure
     */
    organizationsControllerCreate: (
      data: CreateOrganizationDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: OrganizationResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/organizations`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Organizations
     * @name OrganizationsControllerGetCurrent
     * @summary Get current organization details
     * @request GET:/api/v1/organizations/current
     * @secure
     */
    organizationsControllerGetCurrent: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: OrganizationResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/organizations/current`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Organizations
     * @name OrganizationsControllerUpdateCurrent
     * @summary Update current organization (admin only)
     * @request PATCH:/api/v1/organizations/current
     * @secure
     */
    organizationsControllerUpdateCurrent: (
      data: UpdateOrganizationDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: OrganizationResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/organizations/current`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesControllerUploadFile
     * @summary Upload a file
     * @request POST:/api/v1/files/upload
     * @secure
     */
    filesControllerUploadFile: (
      data: {
        /** @format binary */
        file?: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/files/upload`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Patients
     * @name PatientsControllerCreate
     * @summary Create a new patient
     * @request POST:/api/v1/patients
     * @secure
     */
    patientsControllerCreate: (
      data: CreatePatientDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: PatientResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/patients`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Patients
     * @name PatientsControllerFindAll
     * @summary List all patients with pagination and filtering
     * @request GET:/api/v1/patients
     * @secure
     */
    patientsControllerFindAll: (
      query?: {
        /**
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * @min 1
         * @max 1000
         * @default 10
         */
        limit?: number;
        search?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: "ASC" | "DESC";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: PatientResponseDto[];
        },
        ErrorResponse
      >({
        path: `/api/v1/patients`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Patients
     * @name PatientsControllerSearch
     * @summary Search patients by name or phone
     * @request GET:/api/v1/patients/search
     * @secure
     */
    patientsControllerSearch: (
      query: {
        q: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: PatientResponseDto[];
        },
        ErrorResponse
      >({
        path: `/api/v1/patients/search`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Patients
     * @name PatientsControllerFindOne
     * @summary Get patient by ID
     * @request GET:/api/v1/patients/{id}
     * @secure
     */
    patientsControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: PatientResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/patients/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Patients
     * @name PatientsControllerUpdate
     * @summary Update patient
     * @request PATCH:/api/v1/patients/{id}
     * @secure
     */
    patientsControllerUpdate: (
      id: string,
      data: UpdatePatientDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: PatientResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/patients/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Patients
     * @name PatientsControllerRemove
     * @summary Delete patient
     * @request DELETE:/api/v1/patients/{id}
     * @secure
     */
    patientsControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/patients/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Patients
     * @name PatientsControllerSubmitMedicalHistory
     * @summary Submit medical history for a patient (public - no auth required)
     * @request POST:/api/v1/patients/{id}/medical-history
     * @secure
     */
    patientsControllerSubmitMedicalHistory: (
      id: string,
      data: SubmitMedicalHistoryDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: MedicalHistorySubmissionResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/patients/${id}/medical-history`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Patients
     * @name PatientsControllerGetMedicalHistory
     * @summary Get medical history submission for a patient (public - no auth required)
     * @request GET:/api/v1/patients/{id}/medical-history
     * @secure
     */
    patientsControllerGetMedicalHistory: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: MedicalHistorySubmissionResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/patients/${id}/medical-history`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Patients
     * @name PatientsControllerMigrateMedicalHistoryQuestionText
     * @summary Migrate existing medical history to include question text
     * @request POST:/api/v1/patients/migrate/medical-history-question-text
     * @secure
     */
    patientsControllerMigrateMedicalHistoryQuestionText: (
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/patients/migrate/medical-history-question-text`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Appointments
     * @name AppointmentsControllerCreate
     * @summary Create a new appointment
     * @request POST:/api/v1/appointments
     * @secure
     */
    appointmentsControllerCreate: (
      data: CreateAppointmentDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/appointments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Appointments
     * @name AppointmentsControllerFindAll
     * @summary List all appointments with role-based filtering
     * @request GET:/api/v1/appointments
     * @secure
     */
    appointmentsControllerFindAll: (
      query?: {
        /**
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * @min 1
         * @max 1000
         * @default 10
         */
        limit?: number;
        /** Filter by specific date (YYYY-MM-DD) */
        date?: string;
        /** Start date for range filtering */
        startDate?: string;
        /** End date for range filtering */
        endDate?: string;
        /** Filter by patient ID */
        patientId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: Object[];
        },
        ErrorResponse
      >({
        path: `/api/v1/appointments`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Appointments
     * @name AppointmentsControllerGetTodayStats
     * @summary Get today's appointment statistics
     * @request GET:/api/v1/appointments/stats/today
     * @secure
     */
    appointmentsControllerGetTodayStats: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/appointments/stats/today`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Appointments
     * @name AppointmentsControllerFindByDate
     * @summary Get appointments by specific date
     * @request GET:/api/v1/appointments/by-date/{date}
     * @secure
     */
    appointmentsControllerFindByDate: (
      date: string,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: Object[];
        },
        ErrorResponse
      >({
        path: `/api/v1/appointments/by-date/${date}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Appointments
     * @name AppointmentsControllerFindOne
     * @summary Get appointment by ID
     * @request GET:/api/v1/appointments/{id}
     * @secure
     */
    appointmentsControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/appointments/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Appointments
     * @name AppointmentsControllerUpdate
     * @summary Update appointment
     * @request PATCH:/api/v1/appointments/{id}
     * @secure
     */
    appointmentsControllerUpdate: (
      id: string,
      data: UpdateAppointmentDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/appointments/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Appointments
     * @name AppointmentsControllerRemove
     * @summary Delete appointment
     * @request DELETE:/api/v1/appointments/{id}
     * @secure
     */
    appointmentsControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/appointments/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatments
     * @name TreatmentsControllerCreate
     * @summary Create a new treatment
     * @request POST:/api/v1/treatments
     * @secure
     */
    treatmentsControllerCreate: (
      data: CreateTreatmentDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: TreatmentResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/treatments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatments
     * @name TreatmentsControllerFindAll
     * @summary List all treatments with role-based filtering
     * @request GET:/api/v1/treatments
     * @secure
     */
    treatmentsControllerFindAll: (
      query?: {
        /**
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * @min 1
         * @max 1000
         * @default 10
         */
        limit?: number;
        /** Filter by patient ID */
        patientId?: string;
        /** Filter by treatment status */
        status?: "planned" | "in-progress" | "completed" | "cancelled";
        /** Filter by treatment type ID */
        treatmentTypeId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: TreatmentResponseDto[];
        },
        ErrorResponse
      >({
        path: `/api/v1/treatments`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatments
     * @name TreatmentsControllerGetPatientStats
     * @summary Get treatment statistics for a patient
     * @request GET:/api/v1/treatments/patient/{patientId}/stats
     * @secure
     */
    treatmentsControllerGetPatientStats: (
      patientId: string,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/treatments/patient/${patientId}/stats`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatments
     * @name TreatmentsControllerFindOne
     * @summary Get treatment by ID
     * @request GET:/api/v1/treatments/{id}
     * @secure
     */
    treatmentsControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: TreatmentResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/treatments/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatments
     * @name TreatmentsControllerUpdate
     * @summary Update treatment
     * @request PATCH:/api/v1/treatments/{id}
     * @secure
     */
    treatmentsControllerUpdate: (
      id: string,
      data: UpdateTreatmentDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: TreatmentResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/treatments/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatments
     * @name TreatmentsControllerRemove
     * @summary Delete treatment
     * @request DELETE:/api/v1/treatments/{id}
     * @secure
     */
    treatmentsControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/treatments/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatment Types
     * @name TreatmentTypesControllerCreateCategory
     * @summary Create a treatment category
     * @request POST:/api/v1/treatment-types/categories
     * @secure
     */
    treatmentTypesControllerCreateCategory: (
      data: CreateTreatmentCategoryDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: TreatmentCategoryResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/treatment-types/categories`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatment Types
     * @name TreatmentTypesControllerFindAllCategories
     * @summary Get all treatment categories
     * @request GET:/api/v1/treatment-types/categories
     * @secure
     */
    treatmentTypesControllerFindAllCategories: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: TreatmentCategoryResponseDto[];
        },
        ErrorResponse
      >({
        path: `/api/v1/treatment-types/categories`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatment Types
     * @name TreatmentTypesControllerUpdateCategory
     * @summary Update a treatment category
     * @request PATCH:/api/v1/treatment-types/categories/{id}
     * @secure
     */
    treatmentTypesControllerUpdateCategory: (
      id: string,
      data: UpdateTreatmentCategoryDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: TreatmentCategoryResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/treatment-types/categories/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatment Types
     * @name TreatmentTypesControllerRemoveCategory
     * @summary Delete a treatment category
     * @request DELETE:/api/v1/treatment-types/categories/{id}
     * @secure
     */
    treatmentTypesControllerRemoveCategory: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/treatment-types/categories/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatment Types
     * @name TreatmentTypesControllerCreateType
     * @summary Create a treatment type
     * @request POST:/api/v1/treatment-types/types
     * @secure
     */
    treatmentTypesControllerCreateType: (
      data: CreateTreatmentTypeDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: TreatmentTypeResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/treatment-types/types`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatment Types
     * @name TreatmentTypesControllerFindAllTypes
     * @summary Get all treatment types
     * @request GET:/api/v1/treatment-types/types
     * @secure
     */
    treatmentTypesControllerFindAllTypes: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: TreatmentTypeResponseDto[];
        },
        ErrorResponse
      >({
        path: `/api/v1/treatment-types/types`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatment Types
     * @name TreatmentTypesControllerUpdateType
     * @summary Update a treatment type
     * @request PATCH:/api/v1/treatment-types/types/{id}
     * @secure
     */
    treatmentTypesControllerUpdateType: (
      id: string,
      data: UpdateTreatmentTypeDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: TreatmentTypeResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/treatment-types/types/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Treatment Types
     * @name TreatmentTypesControllerRemoveType
     * @summary Delete a treatment type
     * @request DELETE:/api/v1/treatment-types/types/{id}
     * @secure
     */
    treatmentTypesControllerRemoveType: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/treatment-types/types/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payments
     * @name PaymentsControllerCreate
     * @summary Create a new payment
     * @request POST:/api/v1/payments
     * @secure
     */
    paymentsControllerCreate: (
      data: CreatePaymentDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: PaymentResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/payments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payments
     * @name PaymentsControllerFindAll
     * @summary List all payments with filtering
     * @request GET:/api/v1/payments
     * @secure
     */
    paymentsControllerFindAll: (
      query?: {
        /**
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * @min 1
         * @max 1000
         * @default 10
         */
        limit?: number;
        /** Filter by patient ID */
        patientId?: string;
        /** Filter by start date (ISO format) */
        startDate?: string;
        /** Filter by end date (ISO format) */
        endDate?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: PaymentResponseDto[];
        },
        ErrorResponse
      >({
        path: `/api/v1/payments`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payments
     * @name PaymentsControllerGetPatientStats
     * @summary Get payment statistics for a patient
     * @request GET:/api/v1/payments/patient/{patientId}/stats
     * @secure
     */
    paymentsControllerGetPatientStats: (
      patientId: string,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/payments/patient/${patientId}/stats`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payments
     * @name PaymentsControllerFindOne
     * @summary Get payment by ID
     * @request GET:/api/v1/payments/{id}
     * @secure
     */
    paymentsControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: PaymentResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/payments/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payments
     * @name PaymentsControllerUpdate
     * @summary Update payment
     * @request PATCH:/api/v1/payments/{id}
     * @secure
     */
    paymentsControllerUpdate: (
      id: string,
      data: UpdatePaymentDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: PaymentResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/payments/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payments
     * @name PaymentsControllerRemove
     * @summary Delete payment
     * @request DELETE:/api/v1/payments/{id}
     * @secure
     */
    paymentsControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/payments/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Medical History
     * @name MedicalHistoryControllerCreate
     * @summary Create a new medical history question
     * @request POST:/api/v1/medical-history
     * @secure
     */
    medicalHistoryControllerCreate: (
      data: CreateMedicalHistoryQuestionDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: MedicalHistoryQuestionResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/medical-history`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Medical History
     * @name MedicalHistoryControllerFindAll
     * @summary Get all medical history questions
     * @request GET:/api/v1/medical-history
     * @secure
     */
    medicalHistoryControllerFindAll: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: MedicalHistoryQuestionResponseDto[];
        },
        ErrorResponse
      >({
        path: `/api/v1/medical-history`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Medical History
     * @name MedicalHistoryControllerFindAllPublic
     * @summary Get all medical history questions for public form (no auth required)
     * @request GET:/api/v1/medical-history/public
     * @secure
     */
    medicalHistoryControllerFindAllPublic: (
      query: {
        orgId: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: MedicalHistoryQuestionResponseDto[];
        },
        ErrorResponse
      >({
        path: `/api/v1/medical-history/public`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Medical History
     * @name MedicalHistoryControllerFindOne
     * @summary Get a medical history question by ID
     * @request GET:/api/v1/medical-history/{id}
     * @secure
     */
    medicalHistoryControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: MedicalHistoryQuestionResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/medical-history/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Medical History
     * @name MedicalHistoryControllerUpdate
     * @summary Update a medical history question
     * @request PATCH:/api/v1/medical-history/{id}
     * @secure
     */
    medicalHistoryControllerUpdate: (
      id: string,
      data: UpdateMedicalHistoryQuestionDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: MedicalHistoryQuestionResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/medical-history/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Medical History
     * @name MedicalHistoryControllerRemove
     * @summary Delete a medical history question
     * @request DELETE:/api/v1/medical-history/{id}
     * @secure
     */
    medicalHistoryControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/medical-history/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notification Settings
     * @name NotificationSettingsControllerGet
     * @summary Get notification settings for the organization
     * @request GET:/api/v1/notification-settings
     * @secure
     */
    notificationSettingsControllerGet: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: NotificationSettingsResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/notification-settings`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notification Settings
     * @name NotificationSettingsControllerUpdate
     * @summary Update notification settings
     * @request PATCH:/api/v1/notification-settings
     * @secure
     */
    notificationSettingsControllerUpdate: (
      data: UpdateNotificationSettingsDto,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: NotificationSettingsResponseDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/notification-settings`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Expenses
     * @name ExpensesControllerCreate
     * @summary Create a new expense
     * @request POST:/api/v1/expenses
     * @secure
     */
    expensesControllerCreate: (
      data: CreateExpenseDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/expenses`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Expenses
     * @name ExpensesControllerFindAll
     * @summary Get all expenses with filtering and pagination
     * @request GET:/api/v1/expenses
     * @secure
     */
    expensesControllerFindAll: (
      query?: {
        /**
         * Page number
         * @example 1
         */
        page?: number;
        /**
         * Items per page
         * @example 10
         */
        limit?: number;
        /**
         * Start date filter
         * @example "2024-01-01"
         */
        startDate?: string;
        /**
         * End date filter
         * @example "2024-12-31"
         */
        endDate?: string;
        /**
         * Filter by doctor ID
         * @example "uuid"
         */
        doctorId?: string;
        /**
         * Filter by expense type
         * @example "lab"
         */
        expenseType?:
          | "lab"
          | "equipment"
          | "utilities"
          | "rent"
          | "salary"
          | "doctor_payment"
          | "other";
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/expenses`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Expenses
     * @name ExpensesControllerGetTotalByDateRange
     * @summary Get total expenses by date range
     * @request GET:/api/v1/expenses/total
     * @secure
     */
    expensesControllerGetTotalByDateRange: (
      query: {
        startDate: string;
        endDate: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/expenses/total`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Expenses
     * @name ExpensesControllerGetTotalByDoctor
     * @summary Get total expenses for a doctor
     * @request GET:/api/v1/expenses/doctor/{doctorId}
     * @secure
     */
    expensesControllerGetTotalByDoctor: (
      doctorId: string,
      query: {
        startDate: string;
        endDate: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/expenses/doctor/${doctorId}`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Expenses
     * @name ExpensesControllerProcessDoctorPayment
     * @summary Process doctor payment from wallet
     * @request POST:/api/v1/expenses/doctor-payment
     * @secure
     */
    expensesControllerProcessDoctorPayment: (
      data: ProcessDoctorPaymentDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/expenses/doctor-payment`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Expenses
     * @name ExpensesControllerFindOne
     * @summary Get a single expense by ID
     * @request GET:/api/v1/expenses/{id}
     * @secure
     */
    expensesControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/expenses/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Expenses
     * @name ExpensesControllerUpdate
     * @summary Update an expense
     * @request PATCH:/api/v1/expenses/{id}
     * @secure
     */
    expensesControllerUpdate: (
      id: string,
      data: UpdateExpenseDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/expenses/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Expenses
     * @name ExpensesControllerRemove
     * @summary Delete an expense (soft delete)
     * @request DELETE:/api/v1/expenses/{id}
     * @secure
     */
    expensesControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/expenses/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardControllerGetStats
     * @summary Get dashboard statistics
     * @request GET:/api/v1/dashboard/stats
     * @secure
     */
    dashboardControllerGetStats: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: DashboardStatsDto;
        },
        ErrorResponse
      >({
        path: `/api/v1/dashboard/stats`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardControllerGetPendingTreatments
     * @summary Get all pending treatments
     * @request GET:/api/v1/dashboard/pending-treatments
     * @secure
     */
    dashboardControllerGetPendingTreatments: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: PendingTreatmentDto[];
        },
        ErrorResponse
      >({
        path: `/api/v1/dashboard/pending-treatments`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardControllerCancelPendingTreatment
     * @summary Cancel a pending treatment
     * @request PATCH:/api/v1/dashboard/pending-treatments/{id}/cancel
     * @secure
     */
    dashboardControllerCancelPendingTreatment: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/dashboard/pending-treatments/${id}/cancel`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Test
     * @name TestControllerAdminOnly
     * @summary Admin only endpoint
     * @request GET:/api/v1/test/admin-only
     * @secure
     */
    testControllerAdminOnly: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/test/admin-only`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Test
     * @name TestControllerDentistOrAdmin
     * @summary Dentist or Admin endpoint
     * @request GET:/api/v1/test/dentist-or-admin
     * @secure
     */
    testControllerDentistOrAdmin: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/test/dentist-or-admin`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Test
     * @name TestControllerViewRevenue
     * @summary View revenue (permission-based)
     * @request GET:/api/v1/test/view-revenue
     * @secure
     */
    testControllerViewRevenue: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/test/view-revenue`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Test
     * @name TestControllerGetCurrentUser
     * @summary Get current user info
     * @request GET:/api/v1/test/current-user
     * @secure
     */
    testControllerGetCurrentUser: (params: RequestParams = {}) =>
      this.request<
        StandardResponse & {
          data?: Object;
        },
        ErrorResponse
      >({
        path: `/api/v1/test/current-user`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
