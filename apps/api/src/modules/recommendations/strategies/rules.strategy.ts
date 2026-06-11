import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { RecommendationDto } from '@gopass/contracts';

@Injectable()
export class RulesRecommendationStrategy {
  constructor(private readonly prisma: PrismaService) {}

  getName(): string {
    return 'RULES';
  }

  async generate(userId: string, projectId?: string): Promise<RecommendationDto[]> {
    const recommendations: RecommendationDto[] = [];

    const overdueTasks = await this.prisma.task.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        assigneeId: userId,
        dueDate: { lt: new Date() },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: { notIn: ['DONE', 'ARCHIVED'] as any },
      },
      take: 5,
      orderBy: { dueDate: 'asc' },
    });

    for (const task of overdueTasks) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'CHANGE_PRIORITY',
        source: 'RULES',
        title: 'Tarea vencida requiere atención',
        description: `La tarea "${task.title}" está vencida desde ${task.dueDate?.toLocaleDateString('es-ES')}. Considera reasignarla o actualizar su fecha límite.`,
        confidence: 0.9,
        taskId: task.id,
        projectId: task.projectId,
        metadata: { dueDate: task.dueDate, currentStatus: task.status },
        createdAt: new Date().toISOString(),
      });
    }

    const blockedTasks = await this.prisma.task.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: 'BLOCKED' as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        priority: { in: ['HIGH', 'URGENT'] as any },
      },
      take: 3,
    });

    for (const task of blockedTasks) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'UNBLOCK_TASK',
        source: 'RULES',
        title: 'Tarea de alta prioridad bloqueada',
        description: `La tarea "${task.title}" está bloqueada y es de prioridad ${task.priority}. Revisa las dependencias.`,
        confidence: 0.85,
        taskId: task.id,
        projectId: task.projectId,
        metadata: { priority: task.priority },
        createdAt: new Date().toISOString(),
      });
    }

    return recommendations;
  }
}
