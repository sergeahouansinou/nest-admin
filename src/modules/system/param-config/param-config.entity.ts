import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'

import { CommonEntity } from '~/common/entity/common.entity'

@Entity({ name: 'sys_config' })
export class ParamConfigEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Nom de la configuration' })
  name: string

  @Column({ type: 'varchar', length: 50, unique: true })
  @ApiProperty({ description: 'Nom de clé de la configuration' })
  key: string

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({ description: 'Valeur de la configuration' })
  value: string

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({ description: 'Description de la configuration' })
  remark: string
}
