import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class DlqService {
  private readonly logger = new Logger(DlqService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async reportDeadLetterEvents() {
    const count = await this.prisma.outboxEvent.count({
      where: { status: 'DEAD_LETTER' },
    });

    if (count > 0) {
      this.logger.warn(`[dlq] ${count} events in dead letter queue — manual intervention required`);
      // TODO: send alert via notification channel (Slack, PagerDuty, email).
    }
  }
}
