import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

export function useGlobalSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => analyticsService.getSummary(),
    staleTime: 1000 * 60, // 1 min
  });
}

export function useProjectAnalytics(projectId: string) {
  return useQuery({
    queryKey: ['analytics', 'project', projectId],
    queryFn: () => analyticsService.getProjectAnalytics(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60,
  });
}
