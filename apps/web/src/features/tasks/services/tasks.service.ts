import { get, post, patch } from '../../../shared/services/http-client';
import type { TaskDto, CreateTaskDto, UpdateTaskDto } from '@gopass/contracts';
import { TaskStatus } from '@gopass/contracts';

export const tasksService = {
  getByProject: (projectId: string) =>
    get<TaskDto[]>(`/projects/${projectId}/tasks`),

  getById: (id: string) =>
    get<TaskDto>(`/tasks/${id}`),

  getOverdue: () =>
    get<TaskDto[]>('/tasks/overdue'),

  create: (projectId: string, data: CreateTaskDto) =>
    post<TaskDto>(`/projects/${projectId}/tasks`, data),

  update: (id: string, data: UpdateTaskDto) =>
    patch<TaskDto>(`/tasks/${id}`, data),

  updateStatus: (id: string, status: TaskStatus, comment?: string) =>
    patch<TaskDto>(`/tasks/${id}/status`, { status, comment }),

  archive: (id: string) =>
    post<TaskDto>(`/tasks/${id}/archive`),

  restore: (id: string) =>
    post<TaskDto>(`/tasks/${id}/restore`),
};
