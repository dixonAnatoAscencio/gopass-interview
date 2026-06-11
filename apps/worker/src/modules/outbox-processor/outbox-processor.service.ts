import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  OUTBOX_PROCESS_CRON,
  OUTBOX_PROCESSING_BATCH_SIZE,
  OUTBOX_MAX_RETRIES,
  DLQ_THRESHOLD,
} from '@gopass/shared';

@Injectable()
export class OutboxProcessorService {
  private readonly logger = new Logger(OutboxProcessorService.name);
  private isProcessing = false;

  constructor(private readonly prisma: PrismaService) {}

  @Cron(OUTBOX_PROCESS_CRON)
  async processPendingEvents() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    try {
      const pending = await this.prisma.outboxEvent.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: OUTBOX_PROCESSING_BATCH_SIZE,
      });

      if (pending.length === 0) return;

      this.logger.debug(`Processing ${pending.length} outbox events`);

      for (const event of pending) {
        await this.processEvent(event);
      }
    } catch (err) {
      this.logger.error('Outbox processor error', err);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processEvent(event: { id: string; eventType: string; payload: unknown; retryCount: number }) {
    try {
      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: 'PROCESSING' },
      });

      // Dispatch to internal event bus / message broker here.
      // Currently a stub — replace with real handler dispatch.
      this.logger.log(`[outbox] processing ${event.eventType} (${event.id})`);

      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.warn(`[outbox] failed ${event.id}: ${error}`);

      const newRetryCount = event.retryCount + 1;

      if (newRetryCount >= DLQ_THRESHOLD) {
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'DEAD_LETTER', errorMessage: error, retryCount: newRetryCount },
        });
        this.logger.error(`[outbox] moved ${event.id} to DLQ after ${newRetryCount} retries`);
      } else if (newRetryCount >= OUTBOX_MAX_RETRIES) {
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'FAILED', failedAt: new Date(), errorMessage: error, retryCount: newRetryCount },
        });
      } else {
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'PENDING', retryCount: newRetryCount, errorMessage: error },
        });
      }
    }
  }
}
