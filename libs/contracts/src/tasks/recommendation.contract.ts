import { TaskPriority } from '../common/enums';

export type RecommendationSource = 'RULES' | 'AI' | 'HYBRID';
export type RecommendationType =
  | 'REASSIGN_TASK'
  | 'CHANGE_PRIORITY'
  | 'ADD_COLLABORATOR'
  | 'BREAK_DOWN_TASK'
  | 'SET_DUE_DATE'
  | 'UNBLOCK_TASK';

export interface RecommendationDto {
  id: string;
  type: RecommendationType;
  source: RecommendationSource;
  title: string;
  description: string;
  confidence: number;
  taskId?: string | null;
  projectId?: string | null;
  metadata?: Record<string, unknown> | null;
  acceptedAt?: string | null;
  dismissedAt?: string | null;
  createdAt: string;
}

export interface AiSuggestion {
  suggestions: string[];
  estimatedPriority?: TaskPriority;
  estimatedHours?: number;
  tags?: string[];
  source: RecommendationSource;
}
