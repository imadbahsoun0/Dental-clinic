import { SetMetadata } from '@nestjs/common';

export enum Permission {
  // Patient permissions
  VIEW_PATIENTS = 'view_patients',
  CREATE_PATIENT = 'create_patient',
  UPDATE_PATIENT = 'update_patient',
  DELETE_PATIENT = 'delete_patient',

  // Appointment permissions
  VIEW_APPOINTMENTS = 'view_appointments',
  VIEW_OWN_APPOINTMENTS = 'view_own_appointments',
  CREATE_APPOINTMENT = 'create_appointment',
  UPDATE_APPOINTMENT = 'update_appointment',
  DELETE_APPOINTMENT = 'delete_appointment',

  // Treatment permissions
  VIEW_TREATMENTS = 'view_treatments',
  VIEW_OWN_TREATMENTS = 'view_own_treatments',
  CREATE_TREATMENT = 'create_treatment',
  UPDATE_TREATMENT = 'update_treatment',
  DELETE_TREATMENT = 'delete_treatment',

  // Payment permissions
  VIEW_PAYMENTS = 'view_payments',
  CREATE_PAYMENT = 'create_payment',
  UPDATE_PAYMENT = 'update_payment',
  DELETE_PAYMENT = 'delete_payment',

  // Expense permissions
  VIEW_EXPENSES = 'view_expenses',
  CREATE_EXPENSE = 'create_expense',
  UPDATE_EXPENSE = 'update_expense',
  DELETE_EXPENSE = 'delete_expense',

  // Revenue permissions
  VIEW_REVENUE = 'view_revenue',
  VIEW_OWN_REVENUE = 'view_own_revenue',
  VIEW_ALL_REVENUE = 'view_all_revenue',

  // User management permissions
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',

  // Settings permissions
  VIEW_SETTINGS = 'view_settings',
  UPDATE_SETTINGS = 'update_settings',
}

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
