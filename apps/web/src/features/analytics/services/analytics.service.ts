import { get } from '../../../shared/services/http-client';

export interface GlobalSummary {
  totalProjects: number;
  totalTasks: number;
  byStatus: Record<string, number>;
  overdueTasks: number;
  completionRate: number;
}

export interface ProjectAnalytics {
  projectId: string;
  totalTasks: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdueTasks: number;
  completionRate: number;
}

export const analyticsService = {
  getSummary: () =>
    get<GlobalSummary>('/analytics/summary'),

  getProjectAnalytics: (projectId: string) =>
    get<ProjectAnalytics>(`/projects/${projectId}/analytics`),
};
