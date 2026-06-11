import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../services/projects.service';
import type { CreateProjectDto, UpdateProjectDto } from '@gopass/contracts';

export const PROJECT_KEYS = {
  all:    () => ['projects'] as const,
  list:   (params?: object) => ['projects', 'list', params] as const,
  detail: (id: string) => ['projects', id] as const,
};

export function useProjects(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: PROJECT_KEYS.list(params),
    queryFn: () => projectsService.getAll(params),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: () => projectsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectDto) => projectsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECT_KEYS.all() }),
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProjectDto) => projectsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.all() });
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.detail(id) });
    },
  });
}

export function useArchiveProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsService.archive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECT_KEYS.all() }),
  });
}

export function useRestoreProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsService.restore(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECT_KEYS.all() }),
  });
}
