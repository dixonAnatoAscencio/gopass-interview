import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RecommendationsService } from './recommendations.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@gopass/contracts';
import { RATE_LIMIT_AI_LIMIT, RATE_LIMIT_DEFAULT_TTL } from '@gopass/shared';

@ApiTags('recommendations')
@ApiBearerAuth('access-token')
@Controller({ version: '1' })
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('recommendations')
  @ApiOperation({ summary: 'Get recommendations for current user' })
  getForUser(@CurrentUser() user: AuthUser) {
    return this.recommendationsService.getForUser(user.id);
  }

  @Get('projects/:projectId/recommendations')
  @ApiOperation({ summary: 'Get recommendations for a project' })
  getForProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.recommendationsService.getForProject(projectId, user.id);
  }

  @Post('tasks/:taskId/ai-suggestions')
  @Throttle({ default: { limit: RATE_LIMIT_AI_LIMIT, ttl: RATE_LIMIT_DEFAULT_TTL } })
  @ApiOperation({ summary: 'Get AI suggestions for a specific task' })
  getAiSuggestions(@Param('taskId') taskId: string) {
    return this.recommendationsService.getAiSuggestionsForTask(taskId);
  }
}
