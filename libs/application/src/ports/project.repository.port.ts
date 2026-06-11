import type { ProjectDto, CreateProjectDto, UpdateProjectDto, PaginatedResponse, PaginationQuery } from '@gopass/contracts';
import type { ProjectStatus } from '@gopass/contracts';

export interface ProjectFilterOptions extends PaginationQuery {
  ownerId?: string;
  memberId?: string;
  status?: ProjectStatus;
  search?: string;
}

export abstract class IProjectRepository {
  abstract findById(id: string): Promise<ProjectDto | null>;
  abstract findMany(filter: ProjectFilterOptions): Promise<PaginatedResponse<ProjectDto>>;
  abstract findByOwner(ownerId: string): Promise<ProjectDto[]>;
  abstract create(data: CreateProjectDto & { ownerId: string }): Promise<ProjectDto>;
  abstract update(id: string, data: UpdateProjectDto): Promise<ProjectDto>;
  abstract archive(id: string, archivedById: string): Promise<ProjectDto>;
  abstract restore(id: string, restoredById: string): Promise<ProjectDto>;
  abstract delete(id: string): Promise<void>;
  abstract isMember(projectId: string, userId: string): Promise<boolean>;
  abstract getMemberRole(projectId: string, userId: string): Promise<string | null>;
}
