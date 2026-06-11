import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { RulesRecommendationStrategy } from './strategies/rules.strategy';

@Module({
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService,
    RulesRecommendationStrategy,
  ],
})
export class RecommendationsModule {}
