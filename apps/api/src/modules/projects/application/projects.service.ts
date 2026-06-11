import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProjectsRepository } from '../infrastructure/projects.repository';
import { OutboxRepository } from '../../infrastructure/outbox/outbox.repository';
import type { CreateProjectDto, UpdateProjectDto, PaginationQuery } from '@gopass/contracts';
import { OutboxEventType } from '@gopass/contracts';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  async create(dto: CreateProjectDto, ownerId: string) {
    const project = await this.projectsRepository.create({ ...dto, ownerId });

    await this.outboxRepository.create({
      eventType: OutboxEventType.PROJECT_CREATED,
      aggregateId: project.id,
      aggregateType: 'Project',
      payload: { projectId: project.id, name: project.name, ownerId },
    });

    return project;
  }

  async findAll(query: PaginationQuery, userId: string) {
    return this.projectsRepository.findMany(query, userId);
  }

  async findOneOrThrow(id: string) {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException(`Project not found: ${id}`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    await this.assertOwnerOrManager(id, userId);
    return this.projectsRepository.update(id, dto);
  }

  async archive(id: string, userId: string) {
    await this.assertOwnerOrManager(id, userId);
    const project = await this.projectsRepository.archive(id, userId);

    await this.outboxRepository.create({
      eventType: OutboxEventType.PROJECT_ARCHIVED,
      aggregateId: id,
      aggregateType: 'Project',
      payload: { projectId: id, archivedById: userId },
    });

    return project;
  }

  async restore(id: string, userId: string) {
    await this.assertOwnerOrManager(id, userId);
    const project = await this.projectsRepository.restore(id, userId);

    await this.outboxRepository.create({
      eventType: OutboxEventType.PROJECT_RESTORED,
      aggregateId: id,
      aggregateType: 'Project',
      payload: { projectId: id, restoredById: userId },
    });

    return project;
  }

  async remove(id: string, userId: string) {
    await this.assertOwnerOrManager(id, userId);
    return this.projectsRepository.delete(id);
  }

  private async assertOwnerOrManager(projectId: string, userId: string) {
    const project = await this.findOneOrThrow(projectId);
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can perform this action');
    }
  }
}
