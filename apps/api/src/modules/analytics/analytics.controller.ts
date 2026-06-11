import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@gopass/contracts';

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@Controller({ version: '1' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('analytics/summary')
  @ApiOperation({ summary: 'Get global analytics summary for current user' })
  getSummary(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getGlobalSummary(user.id);
  }

  @Get('projects/:projectId/analytics')
  @ApiOperation({ summary: 'Get analytics for a specific project' })
  getProjectAnalytics(@Param('projectId') projectId: string) {
    return this.analyticsService.getProjectAnalytics(projectId);
  }

  @Get('projects/:projectId/dashboard')
  @ApiOperation({ summary: 'Get project dashboard stats' })
  getProjectDashboard(@Param('projectId') projectId: string) {
    return this.analyticsService.getProjectAnalytics(projectId);
  }
}
