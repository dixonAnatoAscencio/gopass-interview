import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './application/tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@gopass/contracts';

@ApiTags('tasks')
@ApiBearerAuth('access-token')
@Controller({ path: 'projects/:projectId/tasks', version: '1' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task in a project' })
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.create(projectId, dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks in a project' })
  findAll(
    @Param('projectId') projectId: string,
    @Query() query: Record<string, string>,
    @CurrentUser() _user: AuthUser,
  ) {
    return this.tasksService.findByProject(projectId, query);
  }
}

// Separate controller for task-level operations
@ApiTags('tasks')
@ApiBearerAuth('access-token')
@Controller({ path: 'tasks', version: '1' })
export class TaskOperationsController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('overdue')
  @ApiOperation({ summary: 'List overdue tasks' })
  getOverdue(@CurrentUser() user: AuthUser) {
    return this.tasksService.findOverdue(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOneOrThrow(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.update(id, dto, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.updateStatus(id, dto.status, user.id, dto.comment);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive task' })
  archive(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.tasksService.archive(id, user.id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore archived task' })
  restore(@Param('id') id: string, @CurrentUser() _user: AuthUser) {
    return this.tasksService.restore(id);
  }
}
