import { SetMetadata } from '@nestjs/common';
import type { ProjectRole, UserRole } from '@gopass/contracts';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (UserRole | ProjectRole)[]) => SetMetadata(ROLES_KEY, roles);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
