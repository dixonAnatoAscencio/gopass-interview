import { Injectable } from '@nestjs/common';
import type { OutboxEventType } from '@gopass/contracts';
import { OutboxEventStatus } from '@gopass/contracts';
import { PrismaService } from '../prisma/prisma.service';

interface CreateOutboxEventDto {
  eventType: OutboxEventType;
  aggregateId: string;
  aggregateType: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class OutboxRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOutboxEventDto) {
    return this.prisma.outboxEvent.create({
      data: {
        eventType: data.eventType,
        aggregateId: data.aggregateId,
        aggregateType: data.aggregateType,
        payload: data.payload,
        status: OutboxEventStatus.PENDING as unknown as Parameters<typeof this.prisma.outboxEvent.create>[0]['data']['status'],
      },
    });
  }

  async findPending(limit = 50) {
    return this.prisma.outboxEvent.findMany({
      where: { status: OutboxEventStatus.PENDING as unknown as Parameters<typeof this.prisma.outboxEvent.findMany>[0]['where']['status'] },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async markAsProcessed(id: string) {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxEventStatus.PROCESSED as unknown as Parameters<typeof this.prisma.outboxEvent.update>[0]['data']['status'],
        processedAt: new Date(),
      },
    });
  }

  async markAsFailed(id: string, errorMessage: string) {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxEventStatus.FAILED as unknown as Parameters<typeof this.prisma.outboxEvent.update>[0]['data']['status'],
        failedAt: new Date(),
        errorMessage,
        retryCount: { increment: 1 },
      },
    });
  }

  async moveToDeadLetter(id: string) {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxEventStatus.DEAD_LETTER as unknown as Parameters<typeof this.prisma.outboxEvent.update>[0]['data']['status'],
      },
    });
  }
}
