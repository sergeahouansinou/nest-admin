import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'

import { CommonEntity } from '~/common/entity/common.entity'

@Entity({ name: 'sys_captcha_log' })
export class CaptchaLogEntity extends CommonEntity {
  @Column({ name: 'user_id', nullable: true })
  @ApiProperty({ description: 'ID utilisateur' })
  userId: number

  @Column({ nullable: true })
  @ApiProperty({ description: 'Compte' })
  account: string

  @Column({ nullable: true })
  @ApiProperty({ description: 'Code de vérification' })
  code: string

  @Column({ nullable: true })
  @ApiProperty({ description: 'Fournisseur du code de vérification' })
  provider: 'sms' | 'email'
}
