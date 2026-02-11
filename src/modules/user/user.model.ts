import { ApiProperty } from '@nestjs/swagger'

export class AccountInfo {
  @ApiProperty({ description: 'Nom d\'utilisateur' })
  username: string

  @ApiProperty({ description: 'Surnom' })
  nickname: string

  @ApiProperty({ description: 'E-mail' })
  email: string

  @ApiProperty({ description: 'Numéro de téléphone' })
  phone: string

  @ApiProperty({ description: 'Remarque' })
  remark: string

  @ApiProperty({ description: 'Avatar' })
  avatar: string
}
