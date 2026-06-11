import type { OutboxEventStatus, OutboxEventType } from '@gopass/contracts';

export interface OutboxEventData {
  id: string;
  eventType: OutboxEventType;
  aggregateId: string;
  aggregateType: string;
  payload: Record<string, unknown>;
  status: OutboxEventStatus;
  retryCount: number;
  processedAt?: Date | null;
  failedAt?: Date | null;
  errorMessage?: string | null;
  createdAt: Date;
}

export abstract class IOutboxRepository {
  abstract create(data: Omit<OutboxEventData, 'id' | 'status' | 'retryCount' | 'createdAt'>): Promise<OutboxEventData>;
  abstract findPending(limit: number): Promise<OutboxEventData[]>;
  abstract markAsProcessed(id: string): Promise<void>;
  abstract markAsFailed(id: string, error: string): Promise<void>;
  abstract moveToDeadLetter(id: string): Promise<void>;
  abstract incrementRetry(id: string): Promise<void>;
}
