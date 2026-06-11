import { get, post } from '../../../shared/services/http-client';
import type { RecommendationDto, AiSuggestion } from '@gopass/contracts';

export const recommendationsService = {
  getAll: () =>
    get<RecommendationDto[]>('/recommendations'),

  getByProject: (projectId: string) =>
    get<RecommendationDto[]>(`/projects/${projectId}/recommendations`),

  getAiSuggestions: (taskId: string) =>
    post<AiSuggestion>(`/tasks/${taskId}/ai-suggestions`),
};
