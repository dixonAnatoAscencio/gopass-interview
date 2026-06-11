import type { AiSuggestion } from '@gopass/contracts';

export interface AiTaskSuggestionRequest {
  title: string;
  description?: string;
  projectContext?: string;
  existingTasks?: string[];
}

export abstract class IAiProvider {
  abstract getTaskSuggestions(request: AiTaskSuggestionRequest): Promise<AiSuggestion>;
  abstract isAvailable(): Promise<boolean>;
}
