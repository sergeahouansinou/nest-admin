import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'

import { CommonEntity } from '~/common/entity/common.entity'

@Entity({ name: 'tool_storage' })
export class Storage extends CommonEntity {
  @Column({ type: 'varchar', length: 200, comment: 'Nom du fichier' })
  @ApiProperty({ description: 'Nom du fichier' })
  name: string

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'Nom réel du fichier',
  })
  @ApiProperty({ description: 'Nom réel du fichier' })
  fileName: string

  @Column({ name: 'ext_name', type: 'varchar', nullable: true })
  @ApiProperty({ description: 'Extension' })
  extName: string

  @Column({ type: 'varchar' })
  @ApiProperty({ description: 'Type de fichier' })
  path: string

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({ description: 'Type de fichier' })
  type: string

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({ description: 'Taille du fichier' })
  size: string

  @Column({ nullable: true, name: 'user_id' })
  @ApiProperty({ description: 'ID utilisateur' })
  userId: number
}
