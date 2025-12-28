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
         * @max 100
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
