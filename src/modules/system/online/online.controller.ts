import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'

import { FastifyRequest } from 'fastify'

import { ApiResult } from '~/common/decorators/api-result.decorator'
import { ApiSecurityAuth } from '~/common/decorators/swagger.decorator'

import { AuthUser } from '~/modules/auth/decorators/auth-user.decorator'

import { definePermission, Perm } from '~/modules/auth/decorators/permission.decorator'

import { KickDto } from './online.dto'
import { OnlineUserInfo } from './online.model'
import { OnlineService } from './online.service'

export const permissions = definePermission('system:online', ['list', 'kick'] as const)

@ApiTags('System - Module des utilisateurs en ligne')
@ApiSecurityAuth()
@ApiExtraModels(OnlineUserInfo)
@Controller('online')
export class OnlineController {
  constructor(private onlineService: OnlineService) {}

  @Get('list')
  @ApiOperation({ summary: 'Consulter les utilisateurs actuellement en ligne' })
  @ApiResult({ type: [OnlineUserInfo] })
  @Perm(permissions.LIST)
  async list(@Req() req: FastifyRequest): Promise<OnlineUserInfo[]> {
    return this.onlineService.listOnlineUser(req.accessToken)
  }

  @Post('kick')
  @ApiOperation({ summary: 'Déconnecter un utilisateur en ligne spécifié' })
  @Perm(permissions.KICK)
  async kick(@Body() dto: KickDto, @AuthUser() user: IAuthUser): Promise<void> {
    await this.onlineService.kickUser(dto.tokenId, user)
  }
}
