import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'

import { CompleteEntity } from '~/common/entity/common.entity'

@Entity({ name: 'sys_dict_type' })
export class DictTypeEntity extends CompleteEntity {
  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Nom du dictionnaire' })
  name: string

  @Column({ type: 'varchar', length: 50, unique: true })
  @ApiProperty({ description: 'Code du dictionnaire' })
  code: string

  @Column({ type: 'tinyint', default: 1 })
  @ApiProperty({ description: ' Statut' })
  status: number

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({ description: 'Remarque' })
  remark: string
}
