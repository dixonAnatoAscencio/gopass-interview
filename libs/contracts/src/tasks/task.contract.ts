import { z } from 'zod';
import { TaskPriority, TaskStatus } from '../common/enums';
import { UserDto } from '../users/user.contract';

export const CreateTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedHours: z.number().positive().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  idempotencyKey: z.string().uuid().optional(),
});

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedHours: z.number().positive().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;

export const UpdateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  comment: z.string().max(500).optional(),
  idempotencyKey: z.string().uuid().optional(),
});

export type UpdateTaskStatusDto = z.infer<typeof UpdateTaskStatusSchema>;

export interface TaskStatusHistoryDto {
  id: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  comment?: string | null;
  changedBy: UserDto;
  createdAt: string;
}

export interface TaskCommentDto {
  id: string;
  content: string;
  author: UserDto;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assignee?: UserDto | null;
  createdBy: UserDto;
  dueDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  tags: string[];
  isOverdue: boolean;
  archivedAt?: string | null;
  archivedBy?: string | null;
  completedAt?: string | null;
  statusHistory?: TaskStatusHistoryDto[];
  comments?: TaskCommentDto[];
  createdAt: string;
  updatedAt: string;
}

export const AddTaskCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type AddTaskCommentDto = z.infer<typeof AddTaskCommentSchema>;

export interface TaskFilterQuery {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  assigneeId?: string;
  isOverdue?: boolean;
  search?: string;
  tags?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
}
