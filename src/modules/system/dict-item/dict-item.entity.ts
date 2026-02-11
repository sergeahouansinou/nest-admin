import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { CompleteEntity } from '~/common/entity/common.entity'

import { DictTypeEntity } from '../dict-type/dict-type.entity'

@Entity({ name: 'sys_dict_item' })
export class DictItemEntity extends CompleteEntity {
  @ManyToOne(() => DictTypeEntity, { cascade: true, createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'type_id' })
  type: DictTypeEntity

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Nom de clé de l\'élément de dictionnaire' })
  label: string

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Valeur de l\'élément de dictionnaire' })
  value: string

  @Column({ nullable: true, comment: 'Ordre de tri de l\'élément de dictionnaire' })
  orderNo: number

  @Column({ type: 'tinyint', default: 1 })
  @ApiProperty({ description: ' Statut' })
  status: number

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({ description: 'Remarque' })
  remark: string
}
