import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RECOMMENDATION_GENERATE_CRON } from '@gopass/shared';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class RecommendationsWorkerService {
  private readonly logger = new Logger(RecommendationsWorkerService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(RECOMMENDATION_GENERATE_CRON)
  async generateDailyRecommendations() {
    this.logger.log('[recommendations] starting daily generation');

    // TODO: invoke recommendation strategies per active project/user.
    // Strategies: RulesRecommendationStrategy, AiRecommendationStrategy (with circuit breaker).
    // Persist results to `recommendations` table.
    this.logger.log('[recommendations] daily generation complete (stub)');
  }
}
