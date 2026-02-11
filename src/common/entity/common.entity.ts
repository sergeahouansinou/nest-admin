import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VirtualColumn,
} from 'typeorm'

// Si vous trouvez la conversion de date trop compliquée côté frontend et que vous ne vous souciez pas de la portabilité, vous pouvez effectuer la conversion côté serveur, par ex. : @UpdateDateColumn({ name: 'updated_at', transformer })
// const transformer: ValueTransformer = {
//   to(value) {
//     return value
//   },
//   from(value) {
//     return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
//   },
// }

export abstract class CommonEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}

export abstract class CompleteEntity extends CommonEntity {
  @ApiHideProperty()
  @Exclude()
  @Column({ name: 'create_by', update: false, comment: 'Créateur', nullable: true })
  createBy: number

  @ApiHideProperty()
  @Exclude()
  @Column({ name: 'update_by', comment: 'Modificateur', nullable: true })
  updateBy: number

  /**
   * Colonne virtuelle non sauvegardée en base de données. Peut poser des problèmes de performance avec de gros volumes de données. Pour des exigences de performance, veuillez implémenter manuellement dans la couche service
   * @see https://typeorm.io/decorator-reference#virtualcolumn
   */
  @ApiProperty({ description: 'Créateur' })
  @VirtualColumn({ query: alias => `SELECT username FROM sys_user WHERE id = ${alias}.create_by` })
  creator: string

  @ApiProperty({ description: 'Modificateur' })
  @VirtualColumn({ query: alias => `SELECT username FROM sys_user WHERE id = ${alias}.update_by` })
  updater: string
}
