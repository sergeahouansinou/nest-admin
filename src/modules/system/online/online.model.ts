import { ApiProperty, OmitType } from '@nestjs/swagger'

import { LoginLogInfo } from '../log/models/log.model'

export class OnlineUserInfo extends OmitType(LoginLogInfo, ['id'] as const) {
  @ApiProperty({ description: 'tokenId' })
  tokenId: string

  @ApiProperty({ description: 'Nom du département' })
  deptName: string

  @ApiProperty({ description: 'ID utilisateur' })
  uid: number

  @ApiProperty({ description: 'Est l\'utilisateur actuellement connecté' })
  isCurrent?: boolean

  @ApiProperty({ description: 'Interdiction de déconnecter l\'utilisateur actuel ou le super administrateur' })
  disable?: boolean
}
