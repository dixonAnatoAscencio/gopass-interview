import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '../services/tasks.service';
import type { CreateTaskDto, UpdateTaskDto } from '@gopass/contracts';
import { TaskStatus } from '@gopass/contracts';

export const TASK_KEYS = {
  all:        () => ['tasks'] as const,
  byProject:  (pid: string) => ['tasks', 'project', pid] as const,
  overdue:    () => ['tasks', 'overdue'] as const,
  detail:     (id: string) => ['tasks', id] as const,
};

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: TASK_KEYS.byProject(projectId),
    queryFn: () => tasksService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useOverdueTasks() {
  return useQuery({
    queryKey: TASK_KEYS.overdue(),
    queryFn: () => tasksService.getOverdue(),
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskDto) => tasksService.create(projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) }),
  });
}

export function useUpdateTask(taskId: string, projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTaskDto) => tasksService.update(taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.detail(taskId) });
      if (projectId) qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) });
    },
  });
}

export function useUpdateTaskStatus(projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status, comment }: { taskId: string; status: TaskStatus; comment?: string }) =>
      tasksService.updateStatus(taskId, status, comment),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.detail(updated.id) });
      if (projectId) qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) });
      qc.invalidateQueries({ queryKey: TASK_KEYS.overdue() });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useArchiveTask(projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksService.archive(taskId),
    onSuccess: (updated) => {
      if (projectId) qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) });
      qc.invalidateQueries({ queryKey: TASK_KEYS.detail(updated.id) });
    },
  });
}
