import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { ApiResult } from '~/common/decorators/api-result.decorator'
import { IdParam } from '~/common/decorators/id-param.decorator'
import { ApiSecurityAuth } from '~/common/decorators/swagger.decorator'
import { Pagination } from '~/helper/paginate/pagination'
import { definePermission, Perm } from '~/modules/auth/decorators/permission.decorator'
import { TaskEntity } from '~/modules/system/task/task.entity'

import { TaskDto, TaskQueryDto, TaskUpdateDto } from './task.dto'
import { TaskService } from './task.service'

export const permissions = definePermission('system:task', {
  LIST: 'list',
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',

  ONCE: 'once',
  START: 'start',
  STOP: 'stop',
} as const)

@ApiTags('System - Module de planification des tâches')
@ApiSecurityAuth()
@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir la liste des tâches' })
  @ApiResult({ type: [TaskEntity], isPage: true })
  @Perm(permissions.LIST)
  async list(@Query() dto: TaskQueryDto): Promise<Pagination<TaskEntity>> {
    return this.taskService.list(dto)
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter une tâche' })
  @Perm(permissions.CREATE)
  async create(@Body() dto: TaskDto): Promise<void> {
    const serviceCall = dto.service.split('.')
    await this.taskService.checkHasMissionMeta(serviceCall[0], serviceCall[1])
    await this.taskService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour la tâche' })
  @Perm(permissions.UPDATE)
  async update(@IdParam() id: number, @Body() dto: TaskUpdateDto): Promise<void> {
    const serviceCall = dto.service.split('.')
    await this.taskService.checkHasMissionMeta(serviceCall[0], serviceCall[1])
    await this.taskService.update(id, dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter les détails de la tâche' })
  @ApiResult({ type: TaskEntity })
  @Perm(permissions.READ)
  async info(@IdParam() id: number): Promise<TaskEntity> {
    return this.taskService.info(id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer la tâche' })
  @Perm(permissions.DELETE)
  async delete(@IdParam() id: number): Promise<void> {
    const task = await this.taskService.info(id)
    await this.taskService.delete(task)
  }

  @Put(':id/once')
  @ApiOperation({ summary: 'Exécuter manuellement une tâche une fois' })
  @Perm(permissions.ONCE)
  async once(@IdParam() id: number): Promise<void> {
    const task = await this.taskService.info(id)
    await this.taskService.once(task)
  }

  @Put(':id/stop')
  @ApiOperation({ summary: 'Arrêter la tâche' })
  @Perm(permissions.STOP)
  async stop(@IdParam() id: number): Promise<void> {
    const task = await this.taskService.info(id)
    await this.taskService.stop(task)
  }

  @Put(':id/start')
  @ApiOperation({ summary: 'Démarrer la tâche' })
  @Perm(permissions.START)
  async start(@IdParam() id: number): Promise<void> {
    const task = await this.taskService.info(id)

    await this.taskService.start(task)
  }
}
