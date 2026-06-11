import { useQuery } from '@tanstack/react-query';
import { recommendationsService } from '../services/recommendations.service';

export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendationsService.getAll(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProjectRecommendations(projectId: string) {
  return useQuery({
    queryKey: ['recommendations', 'project', projectId],
    queryFn: () => recommendationsService.getByProject(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });
}
