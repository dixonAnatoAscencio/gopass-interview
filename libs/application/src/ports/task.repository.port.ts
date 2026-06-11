import type {
  TaskDto,
  CreateTaskDto,
  UpdateTaskDto,
  PaginatedResponse,
  TaskFilterQuery,
  TaskStatus,
} from '@gopass/contracts';
import type { PaginationQuery } from '@gopass/contracts';

export interface TaskFilterOptions extends PaginationQuery, TaskFilterQuery {
  projectId?: string;
}

export abstract class ITaskRepository {
  abstract findById(id: string): Promise<TaskDto | null>;
  abstract findMany(filter: TaskFilterOptions): Promise<PaginatedResponse<TaskDto>>;
  abstract findOverdue(): Promise<TaskDto[]>;
  abstract create(data: CreateTaskDto & { projectId: string; createdById: string }): Promise<TaskDto>;
  abstract update(id: string, data: UpdateTaskDto): Promise<TaskDto>;
  abstract updateStatus(id: string, status: TaskStatus, changedById: string, comment?: string): Promise<TaskDto>;
  abstract archive(id: string, archivedById: string): Promise<TaskDto>;
  abstract restore(id: string): Promise<TaskDto>;
  abstract delete(id: string): Promise<void>;
}
