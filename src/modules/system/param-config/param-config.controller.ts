import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { ApiResult } from '~/common/decorators/api-result.decorator'
import { IdParam } from '~/common/decorators/id-param.decorator'
import { ApiSecurityAuth } from '~/common/decorators/swagger.decorator'
import { Pagination } from '~/helper/paginate/pagination'
import { definePermission, Perm } from '~/modules/auth/decorators/permission.decorator'
import { ParamConfigEntity } from '~/modules/system/param-config/param-config.entity'

import { ParamConfigDto, ParamConfigQueryDto } from './param-config.dto'
import { ParamConfigService } from './param-config.service'

export const permissions = definePermission('system:param-config', {
  LIST: 'list',
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const)

@ApiTags('System - Module de configuration des paramètres')
@ApiSecurityAuth()
@Controller('param-config')
export class ParamConfigController {
  constructor(private paramConfigService: ParamConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir la liste de configuration des paramètres' })
  @ApiResult({ type: [ParamConfigEntity], isPage: true })
  @Perm(permissions.LIST)
  async list(@Query() dto: ParamConfigQueryDto): Promise<Pagination<ParamConfigEntity>> {
    return this.paramConfigService.page(dto)
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter une configuration de paramètre' })
  @Perm(permissions.CREATE)
  async create(@Body() dto: ParamConfigDto): Promise<void> {
    await this.paramConfigService.create(dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter les informations de configuration du paramètre' })
  @ApiResult({ type: ParamConfigEntity })
  @Perm(permissions.READ)
  async info(@IdParam() id: number): Promise<ParamConfigEntity> {
    return this.paramConfigService.findOne(id)
  }

  @Post(':id')
  @ApiOperation({ summary: 'Mettre à jour la configuration du paramètre' })
  @Perm(permissions.UPDATE)
  async update(@IdParam() id: number, @Body() dto: ParamConfigDto): Promise<void> {
    await this.paramConfigService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer la configuration de paramètre spécifiée' })
  @Perm(permissions.DELETE)
  async delete(@IdParam() id: number): Promise<void> {
    await this.paramConfigService.delete(id)
  }
}
