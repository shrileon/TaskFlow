import type { ValueOf } from './common';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const;

export type UserRole = ValueOf<typeof USER_ROLES>;