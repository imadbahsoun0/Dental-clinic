import { SetMetadata } from '@nestjs/common';

export enum UserRole {
    ADMIN = 'admin',
    DENTIST = 'dentist',
    SECRETARY = 'secretary',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
