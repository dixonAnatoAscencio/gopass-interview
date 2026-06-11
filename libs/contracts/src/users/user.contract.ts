import { z } from 'zod';
import { ProjectRole, UserRole } from '../common/enums';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(128),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithProjectRole extends UserDto {
  projectRole: ProjectRole;
}
