import { UserRole } from '../decorators/roles.decorator';
import { Permission } from '../decorators/permissions.decorator';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin has all permissions
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENT,
    Permission.UPDATE_PATIENT,
    Permission.DELETE_PATIENT,
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT,
    Permission.DELETE_APPOINTMENT,
    Permission.VIEW_TREATMENTS,
    Permission.CREATE_TREATMENT,
    Permission.UPDATE_TREATMENT,
    Permission.DELETE_TREATMENT,
    Permission.VIEW_PAYMENTS,
    Permission.CREATE_PAYMENT,
    Permission.UPDATE_PAYMENT,
    Permission.DELETE_PAYMENT,
    Permission.VIEW_EXPENSES,
    Permission.CREATE_EXPENSE,
    Permission.UPDATE_EXPENSE,
    Permission.DELETE_EXPENSE,
    Permission.VIEW_ALL_REVENUE,
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.VIEW_SETTINGS,
    Permission.UPDATE_SETTINGS,
  ],

  [UserRole.DENTIST]: [
    // Dentist can view patients
    Permission.VIEW_PATIENTS,
    // Dentist can only view/manage their own appointments
    Permission.VIEW_OWN_APPOINTMENTS,
    // Dentist can only view/manage their own treatments
    Permission.VIEW_OWN_TREATMENTS,
    // Dentist can view their own revenue
    Permission.VIEW_OWN_REVENUE,
  ],

  [UserRole.SECRETARY]: [
    // Secretary can manage patients
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENT,
    Permission.UPDATE_PATIENT,
    // Secretary can manage all appointments
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT,
    Permission.DELETE_APPOINTMENT,
    // Secretary can manage all treatments
    Permission.VIEW_TREATMENTS,
    Permission.CREATE_TREATMENT,
    Permission.UPDATE_TREATMENT,
    // Secretary can manage payments
    Permission.VIEW_PAYMENTS,
    Permission.CREATE_PAYMENT,
    Permission.UPDATE_PAYMENT,
    // Secretary can manage expenses
    Permission.VIEW_EXPENSES,
    Permission.CREATE_EXPENSE,
    // Secretary CANNOT view revenue
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}
