import type { RecommendationDto } from '@gopass/contracts';

export abstract class IRecommendationStrategy {
  abstract generate(context: RecommendationContext): Promise<RecommendationDto[]>;
  abstract getName(): string;
}

export interface RecommendationContext {
  projectId?: string;
  userId: string;
  tasks?: unknown[];
  projectStats?: unknown;
}
