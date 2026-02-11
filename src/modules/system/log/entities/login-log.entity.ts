import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm'

import { CommonEntity } from '~/common/entity/common.entity'

import { UserEntity } from '../../../user/user.entity'

@Entity({ name: 'sys_login_log' })
export class LoginLogEntity extends CommonEntity {
  @Column({ nullable: true })
  @ApiProperty({ description: 'IP' })
  ip: string

  @Column({ nullable: true })
  @ApiProperty({ description: 'Adresse' })
  address: string

  @Column({ nullable: true })
  @ApiProperty({ description: 'Méthode de connexion' })
  provider: string

  @Column({ length: 500, nullable: true })
  @ApiProperty({ description: 'User-Agent du navigateur' })
  ua: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>
}
