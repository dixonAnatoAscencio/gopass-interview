import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './shared/prisma/prisma.module';
import { OutboxProcessorModule } from './modules/outbox-processor/outbox-processor.module';
import { OverdueTasksModule } from './modules/overdue-tasks/overdue-tasks.module';
import { RecommendationsWorkerModule } from './modules/recommendations-worker/recommendations-worker.module';
import { DlqModule } from './modules/dlq/dlq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/worker/.env'],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    OutboxProcessorModule,
    OverdueTasksModule,
    RecommendationsWorkerModule,
    DlqModule,
  ],
})
export class WorkerModule {}
