import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ArchivedService } from './archived.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@gopass/contracts';

@ApiTags('archived')
@ApiBearerAuth('access-token')
@Controller({ path: 'archived', version: '1' })
export class ArchivedController {
  constructor(private readonly archivedService: ArchivedService) {}

  @Get('projects')
  @ApiOperation({ summary: 'List archived projects for current user' })
  getArchivedProjects(@CurrentUser() user: AuthUser) {
    return this.archivedService.getArchivedProjects(user.id);
  }

  @Get('tasks')
  @ApiOperation({ summary: 'List archived tasks for current user' })
  getArchivedTasks(@CurrentUser() user: AuthUser) {
    return this.archivedService.getArchivedTasks(user.id);
  }
}
