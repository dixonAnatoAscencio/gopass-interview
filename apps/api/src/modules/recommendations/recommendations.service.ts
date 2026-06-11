import { Injectable } from '@nestjs/common';
import { RulesRecommendationStrategy } from './strategies/rules.strategy';

@Injectable()
export class RecommendationsService {
  constructor(private readonly rulesStrategy: RulesRecommendationStrategy) {}

  async getForUser(userId: string) {
    return this.rulesStrategy.generate(userId);
  }

  async getForProject(projectId: string, userId: string) {
    return this.rulesStrategy.generate(userId, projectId);
  }

  async getAiSuggestionsForTask(_taskId: string) {
    // AI provider fallback: returns rules-based suggestions when AI is unavailable.
    // Replace with real IAiProvider call once provider is configured.
    return {
      suggestions: [
        'Dividir la tarea en sub-tareas más pequeñas',
        'Asignar a un colaborador disponible',
        'Revisar dependencias y desbloquear',
      ],
      source: 'RULES' as const,
    };
  }
}
