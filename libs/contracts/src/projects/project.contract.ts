import { z } from 'zod';
import { ProjectRole, ProjectStatus } from '../common/enums';
import { UserDto } from '../users/user.contract';

export const CreateProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;

export interface ProjectMemberDto {
  id: string;
  user: UserDto;
  role: ProjectRole;
  joinedAt: string;
}

export interface ProjectDto {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  status: ProjectStatus;
  ownerId: string;
  owner: UserDto;
  membersCount: number;
  tasksCount: number;
  completedTasksCount: number;
  archivedAt?: string | null;
  archivedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDashboard {
  project: ProjectDto;
  stats: {
    totalTasks: number;
    todoTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    inReviewTasks: number;
    doneTasks: number;
    overdueTasks: number;
    completionRate: number;
  };
  recentActivity: ActivityItem[];
  upcomingDeadlines: DeadlineItem[];
}

export interface ActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  performedBy: UserDto;
  createdAt: string;
}

export interface DeadlineItem {
  taskId: string;
  taskTitle: string;
  dueDate: string;
  assignee?: UserDto | null;
  priority: string;
  isOverdue: boolean;
}

export const AddProjectMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.nativeEnum(ProjectRole),
});

export type AddProjectMemberDto = z.infer<typeof AddProjectMemberSchema>;
