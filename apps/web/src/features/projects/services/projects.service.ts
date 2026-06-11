import { get, post, patch, del } from '../../../shared/services/http-client';
import type { ProjectDto, PaginatedResponse, CreateProjectDto, UpdateProjectDto } from '@gopass/contracts';

export const projectsService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    get<PaginatedResponse<ProjectDto>>('/projects', { params }),

  getById: (id: string) =>
    get<ProjectDto>(`/projects/${id}`),

  create: (data: CreateProjectDto) =>
    post<ProjectDto>('/projects', data),

  update: (id: string, data: UpdateProjectDto) =>
    patch<ProjectDto>(`/projects/${id}`, data),

  archive: (id: string) =>
    post<ProjectDto>(`/projects/${id}/archive`),

  restore: (id: string) =>
    post<ProjectDto>(`/projects/${id}/restore`),

  remove: (id: string) =>
    del<void>(`/projects/${id}`),
};
