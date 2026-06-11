import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('audit')
@ApiBearerAuth('access-token')
@Controller({ path: 'audit', version: '1' })
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get audit logs for a project' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getProjectLogs(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getProjectAuditLogs(projectId, limit);
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get audit logs for a task' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTaskLogs(
    @Param('taskId') taskId: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getTaskAuditLogs(taskId, limit);
  }
}
