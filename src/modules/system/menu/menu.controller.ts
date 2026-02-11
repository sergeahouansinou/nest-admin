import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { flattenDeep } from 'lodash'

import { ApiResult } from '~/common/decorators/api-result.decorator'
import { IdParam } from '~/common/decorators/id-param.decorator'
import { ApiSecurityAuth } from '~/common/decorators/swagger.decorator'
import { CreatorPipe } from '~/common/pipes/creator.pipe'
import { UpdaterPipe } from '~/common/pipes/updater.pipe'
import { definePermission, getDefinePermissions, Perm } from '~/modules/auth/decorators/permission.decorator'

import { MenuDto, MenuQueryDto, MenuUpdateDto } from './menu.dto'
import { MenuItemInfo } from './menu.model'
import { MenuService } from './menu.service'

export const permissions = definePermission('system:menu', {
  LIST: 'list',
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const)

@ApiTags('System - Module des menus et permissions')
@ApiSecurityAuth()
@Controller('menus')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir la liste de tous les menus' })
  @ApiResult({ type: [MenuItemInfo] })
  @Perm(permissions.LIST)
  async list(@Query() dto: MenuQueryDto) {
    return this.menuService.list(dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir les informations du menu ou de la permission' })
  @Perm(permissions.READ)
  async info(@IdParam() id: number) {
    return this.menuService.getMenuItemAndParentInfo(id)
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter un menu ou une permission' })
  @Perm(permissions.CREATE)
  async create(@Body(CreatorPipe) dto: MenuDto): Promise<void> {
    // check
    await this.menuService.check(dto)
    if (!dto.parentId)
      dto.parentId = null

    await this.menuService.create(dto)
    if (dto.type === 2) {
      // Si une permission est modifiée, rafraîchir les permissions de tous les utilisateurs en ligne
      await this.menuService.refreshOnlineUserPerms()
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour le menu ou la permission' })
  @Perm(permissions.UPDATE)
  async update(@IdParam() id: number, @Body(UpdaterPipe) dto: MenuUpdateDto): Promise<void> {
    // check
    await this.menuService.check(dto)
    if (dto.parentId === -1 || !dto.parentId)
      dto.parentId = null

    await this.menuService.update(id, dto)
    if (dto.type === 2) {
      // Si une permission est modifiée, rafraîchir les permissions de tous les utilisateurs en ligne
      await this.menuService.refreshOnlineUserPerms()
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer le menu ou la permission' })
  @Perm(permissions.DELETE)
  async delete(@IdParam() id: number): Promise<void> {
    if (await this.menuService.checkRoleByMenuId(id))
      throw new BadRequestException('Ce menu a des rôles associés et ne peut pas être supprimé')

    // S'il y a des sous-répertoires, les supprimer également
    const childMenus = await this.menuService.findChildMenus(id)
    await this.menuService.deleteMenuItem(flattenDeep([id, childMenus]))
    // Rafraîchir les permissions des utilisateurs en ligne
    await this.menuService.refreshOnlineUserPerms()
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Obtenir toutes les permissions définies côté serveur' })
  async getPermissions(): Promise<string[]> {
    return getDefinePermissions()
  }
}
