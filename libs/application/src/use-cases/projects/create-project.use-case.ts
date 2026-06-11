import type { CreateProjectDto, ProjectDto } from '@gopass/contracts';
import { OutboxEventType } from '@gopass/contracts';
import type { IProjectRepository } from '../../ports/project.repository.port';
import type { IOutboxRepository } from '../../ports/outbox.repository.port';

export interface CreateProjectInput extends CreateProjectDto {
  ownerId: string;
  idempotencyKey?: string;
}

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly outboxRepository: IOutboxRepository,
  ) {}

  async execute(input: CreateProjectInput): Promise<ProjectDto> {
    const project = await this.projectRepository.create({
      name: input.name,
      description: input.description,
      color: input.color,
      ownerId: input.ownerId,
    });

    await this.outboxRepository.create({
      eventType: OutboxEventType.PROJECT_CREATED,
      aggregateId: project.id,
      aggregateType: 'Project',
      payload: {
        projectId: project.id,
        name: project.name,
        ownerId: project.ownerId,
      },
    });

    return project;
  }
}
