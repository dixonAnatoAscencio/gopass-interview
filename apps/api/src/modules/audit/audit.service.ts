import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import type { AuditAction } from '@gopass/contracts';

export interface CreateAuditLogDto {
  action: AuditAction;
  entityType: string;
  entityId: string;
  projectId?: string;
  userId: string;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        action: dto.action as any,
        entityType: dto.entityType,
        entityId: dto.entityId,
        projectId: dto.projectId,
        userId: dto.userId,
        previousData: dto.previousData as Prisma.InputJsonValue | undefined,
        newData: dto.newData as Prisma.InputJsonValue | undefined,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        correlationId: dto.correlationId,
      },
    });
  }

  async getProjectAuditLogs(projectId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getTaskAuditLogs(taskId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { entityType: 'Task', entityId: taskId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
