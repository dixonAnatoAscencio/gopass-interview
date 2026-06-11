import { Injectable } from '@nestjs/common';
import type { OutboxEventType } from '@gopass/contracts';
import { Prisma } from '@prisma/client';
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
        payload: data.payload as Prisma.InputJsonValue,
        status: 'PENDING',
      },
    });
  }

  async findPending(limit = 50) {
    return this.prisma.outboxEvent.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async markAsProcessed(id: string) {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });
  }

  async markAsFailed(id: string, errorMessage: string) {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        errorMessage,
        retryCount: { increment: 1 },
      },
    });
  }

  async moveToDeadLetter(id: string) {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: { status: 'DEAD_LETTER' },
    });
  }
}
