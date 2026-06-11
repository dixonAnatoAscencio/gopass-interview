import { Module } from '@nestjs/common';
import { RecommendationsWorkerService } from './recommendations-worker.service';

@Module({ providers: [RecommendationsWorkerService] })
export class RecommendationsWorkerModule {}
