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
  };
}
