import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { ApiResult } from '~/common/decorators/api-result.decorator'
import { IdParam } from '~/common/decorators/id-param.decorator'
import { ApiSecurityAuth } from '~/common/decorators/swagger.decorator'
import { UpdaterPipe } from '~/common/pipes/updater.pipe'
import { Pagination } from '~/helper/paginate/pagination'
import { AuthUser } from '~/modules/auth/decorators/auth-user.decorator'
import { definePermission, Perm } from '~/modules/auth/decorators/permission.decorator'
import { DictItemEntity } from '~/modules/system/dict-item/dict-item.entity'

import { DictItemDto, DictItemQueryDto } from './dict-item.dto'
import { DictItemService } from './dict-item.service'

export const permissions = definePermission('system:dict-item', {
  LIST: 'list',
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const)

@ApiTags('System - Module des éléments de dictionnaire')
@ApiSecurityAuth()
@Controller('dict-item')
export class DictItemController {
  constructor(private dictItemService: DictItemService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir la liste des éléments de dictionnaire' })
  @ApiResult({ type: [DictItemEntity], isPage: true })
  @Perm(permissions.LIST)
  async list(@Query() dto: DictItemQueryDto): Promise<Pagination<DictItemEntity>> {
    return this.dictItemService.page(dto)
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter un élément de dictionnaire' })
  @Perm(permissions.CREATE)
  async create(@Body() dto: DictItemDto, @AuthUser() user: IAuthUser): Promise<void> {
    await this.dictItemService.create(dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter les informations de l\'élément de dictionnaire' })
  @ApiResult({ type: DictItemEntity })
  @Perm(permissions.READ)
  async info(@IdParam() id: number): Promise<DictItemEntity> {
    return this.dictItemService.findOne(id)
  }

  @Post(':id')
  @ApiOperation({ summary: 'Mettre à jour l\'élément de dictionnaire' })
  @Perm(permissions.UPDATE)
  async update(@IdParam() id: number, @Body(UpdaterPipe) dto: DictItemDto): Promise<void> {
    await this.dictItemService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer l\'élément de dictionnaire spécifié' })
  @Perm(permissions.DELETE)
  async delete(@IdParam() id: number): Promise<void> {
    await this.dictItemService.delete(id)
  }
}
